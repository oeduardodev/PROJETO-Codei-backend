import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import User from 'App/Models/User'

export default class ProfileController {
    // Método para obter um perfil pelo userID
    public async show({ params, response }: HttpContextContract) {
        const userId = params.id  // Usando o 'id' da URL como o 'userId'

        try {
            const user = await User.findOrFail(userId)
            const username = user.username

            // Buscar o perfil usando o userId
            const profile = await Profile.query()
                .where('userId', userId)  // Encontrar o perfil pelo userId
                .preload('moments')  // Carregar os momentos relacionados ao perfil
                .first()  // Garantir que apenas um perfil seja retornado

            // Verificar se o perfil existe
            if (!profile) {
                return response.notFound({ error: 'Perfil não encontrado' })
            }

            // Retornar o perfil com os momentos relacionados
            return response.ok({ profile, username })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao buscar perfil', details: error.message })
        }
    }

    // Método para adicionar um perfil
    public async store({ request, response }: HttpContextContract) {
        const data = request.only(['userId', 'photo', 'bio', 'technologies', 'friends', 'levels'])

        try {
            const profile = await Profile.create(data)
            return response.created({ profile })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao criar perfil', details: error.message })
        }
    }

    // Método para atualizar um perfil
public async update({ params, request, response }: HttpContextContract) {
    const profileId = params.id;

    // Verifique se o profileId está definido
    if (!profileId) {
        return response.badRequest({ error: 'ID do perfil não foi fornecido' });
    }

    const data = request.only(['photo', 'bio', 'technologies', 'friends', 'levels', 'username']); 

    try {
        const profile = await Profile.findOrFail(profileId);
        const userId = profile.userId; // Obtém o userId do perfil

        // Atualiza os campos permitidos no perfil
        profile.merge({
            photo: data.photo,
            bio: data.bio,
            technologies: data.technologies,
            friends: data.friends,
            levels: data.levels,
        });
        
        await profile.save();

        // Se o nome de usuário foi enviado na requisição, atualize também a tabela User
        if (data.username) {
            const user = await User.findOrFail(userId);
            user.username = data.username; // Atualiza o nome de usuário
            await user.save(); // Salva as alterações no usuário
        }

        return response.ok({ profile, username: data.username }); // Retorna o perfil e o nome de usuário atualizado

    } catch (error) {
        return response.badRequest({ error: 'Erro ao atualizar perfil', details: error.message });
    }
}


    // Método para apagar um perfil
    public async destroy({ params, response }: HttpContextContract) {
        const profileId = params.id

        try {
            const profile = await Profile.findOrFail(profileId)
            await profile.delete()
            return response.ok({ message: 'Perfil deletado com sucesso' })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao deletar perfil', details: error.message })
        }
    }
    // Método para obter o perfil do usuário logado
    public async me({ auth, response }: HttpContextContract) {
        try {
            const userId = auth.user?.id;

            if (!userId) {
                return response.unauthorized({ error: 'Usuário não autenticado' });
            }

            // Tenta encontrar o perfil do usuário logado
            let profile = await Profile.query()
                .where('userId', userId)  // Encontrar o perfil do usuario logado
                .preload('moments')       // Carregar os momentos relacionados ao perfil
                .first();                

            // Se o perfil não existir, crie um novo perfil vazio
            if (!profile) {
                profile = await Profile.create({
                    userId,               // Usa userId como chave primária
                    photo: '',
                    bio: '',
                    technologies: [],
                    friends: [],
                    levels: [],
                });
            }

            // Buscar o nome de usuário
            const user = await User.findOrFail(userId);
            const username = user.username;

            return response.ok({ profile, username });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao obter ou criar perfil', details: error.message });
        }
    }

    // Método adicionar um amigo
    public async addFriend({ auth, params, response }: HttpContextContract) {
        const { friendId } = params;
        const id = auth.user?.id; // Obtém o ID do usuário autenticado
    
        if (!id) {
            return response.unauthorized({ error: 'Usuário não autenticado' });
        }
    
        try {
            const profile = await Profile.findOrFail(id);
    
            if (!profile.friends.includes(friendId)) {
                profile.friends.push(friendId);
                await profile.save();
            }
    
            return response.ok({ message: 'Convite enviado com sucesso', friends: profile.friends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao adicionar amigo', details: error.message });
        }
    }
    
    // Método para remover um amigo
    public async removeFriend({ auth, params, response }: HttpContextContract) {
        const { friendId } = params;
        const id = auth.user?.id; // Obtém o ID do usuário autenticado

        try {
            const profile = await Profile.findOrFail(id);

            // Remove o friendId da lista de amigos
            profile.friends = profile.friends.filter((friend) => friend !== friendId);
            await profile.save();

            return response.ok({ message: 'Amigo removido com sucesso', friends: profile.friends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao remover amigo', details: error.message });
        }
    }

}    
