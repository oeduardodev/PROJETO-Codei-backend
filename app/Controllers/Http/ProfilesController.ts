import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import { v4 as uuidv4 } from 'uuid'
import { uploadToCloudinary } from 'App/Services/CloudinaryService'
import fs from 'fs'
// Removed unused Application import
export default class ProfileController {

    /*
     *  Obtém o perfil do usuário autenticado e logado
     */
    public async me({ auth, response }: HttpContextContract) {
        try {
            const userId = auth.user!.id;

            if (!userId) {
                return response.unauthorized({ error: 'Usuário não autenticado' });
            }

            let profile = await Profile.query().where('userId', userId).preload('moments').first();

            if (!profile) {
                profile = await Profile.create({
                    userId,
                    photo: '',
                    bio: '',
                    technologies: [],
                    friends: [],
                    levels: [],
                    username: auth.user!.username || 'default_username',
                });
            }

            return response.ok({ profile });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao obter ou criar perfil', details: error.message });
        }
    }

    /*
     *  Lista todos os perfis
     */
    public async show({ params, response }: HttpContextContract) {
        const userId = params.id

        try {
            const profile = await Profile.query()
                .where('userId', userId)
                .preload('moments')
                .first()

            if (!profile) {
                return response.notFound({ error: 'Perfil não encontrado' })
            }

            return response.ok({ profile })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao buscar perfil', details: error.message })
        }
    }

    /*
     *  Cria um novo perfil
     */
    public async store({ request, response }: HttpContextContract) {
        const data = request.only(['userId', 'photo', 'bio', 'technologies', 'friends', 'levels', 'username'])

        try {
            const profile = await Profile.create(data)
            return response.created({ profile })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao criar perfil', details: error.message })
        }
    }

    /*
     *  Atualiza um perfil
     */
    public async update({ params, request, response }: HttpContextContract) {
        const profileId = params.id;

        if (!profileId) {
            return response.badRequest({ error: 'ID do perfil não foi fornecido' });
        }

        const data = request.only(['photo', 'bio', 'technologies', 'friends', 'levels', 'username']);

        try {
            const profile = await Profile.findOrFail(profileId);

            profile.merge({
                photo: data.photo,
                bio: data.bio,
                technologies: data.technologies,
                friends: data.friends,
                levels: data.levels,
                username: data.username,
            });

            // Se estiver recebendo um arquivo de imagem, faça upload
            const imageFile = request.file('photo');
            if (imageFile) {
                const imageName = `${uuidv4()}.${imageFile.extname}`;
                const uploadFolder = process.env.TMP_PATH || 'tmp/uploads';
                const imagePath = `${uploadFolder}/${imageName}`;

                // Move o arquivo para uma pasta temporária
                await imageFile.move(uploadFolder, { name: imageName, overwrite: true });

                // Faz upload para Cloudinary
                const uploadResult = await uploadToCloudinary(imagePath);
                profile.photo = (uploadResult as any).secure_url;

                // Remove o arquivo local temporário
                fs.unlinkSync(imagePath);
            }

            await profile.save();

            return response.ok({ profile });

        } catch (error) {
            return response.badRequest({ error: 'Erro ao atualizar perfil', details: error.message });
        }
    }

    /*
     *  Deleta um perfil
     */
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

    /*
     *  Adiciona amigo
     */
    public async addFriend({ auth, params, response }: HttpContextContract) {
        const { friendId } = params;
        const userId = auth.user!.id;

        if (!userId) {
            return response.unauthorized({ error: 'Usuário não autenticado' });
        }

        try {
            const profile = await Profile.query().where('userId', userId).firstOrFail();

            if (!profile.friends.includes(friendId)) {
                profile.friends.push(friendId);
                await profile.save();
            }

            return response.ok({ message: 'Convite enviado com sucesso', friends: profile.friends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao adicionar amigo', details: error.message });
        }
    }

    /*
     *  Remove amigo
     */
    public async removeFriend({ auth, params, response }: HttpContextContract) {
        const { friendId } = params;
        const userId = auth.user!.id;

        try {
            const profile = await Profile.query().where('userId', userId).firstOrFail();

            profile.friends = profile.friends.filter((friend) => friend !== friendId);
            await profile.save();

            return response.ok({ message: 'Amigo removido com sucesso', friends: profile.friends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao remover amigo', details: error.message });
        }
    }

    /*
     *  Lista todos os amigos
     */
    public async listFriends({ auth, response }: HttpContextContract) {
        const userId = auth.user!.id;

        if (!userId) {
            return response.unauthorized({ error: 'Usuário não autenticado' });
        }

        try {
            const profile = await Profile.findOrFail(userId);
            const friendIds = Array.isArray(profile.friends) ? profile.friends.map(String) : [];

            const friends = await Profile.query().whereIn('userId', friendIds);

            const myFriends = friends.filter(friend => {
                const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : [];
                return friendList.includes(String(userId));
            });

            return response.ok({ myFriends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao listar amigos', details: error.message });
        }
    }

    /*
     *  Lista amigos de um usuário pelo ID
     */
    public async listFriendsByID({ params, response }: HttpContextContract) {
        const userId = params.userId || params.id;

        if (!userId) {
            return response.badRequest({ error: 'ID do usuário não foi fornecido' });
        }

        try {
            const profile = await Profile.find(userId);

            if (!profile) {
                return response.notFound({ error: 'Perfil não encontrado' });
            }

            const friendIds = profile.friends.map(String);
            const friends = await Profile.query().whereIn('userId', friendIds);

            const myFriends = friends.filter(friend => {
                const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : [];
                return friendList.includes(String(userId));
            });

            return response.ok({ myFriends });
        } catch (error) {
            return response.badRequest({ error: 'Erro ao listar amigos', details: error.message });
        }
    }
}