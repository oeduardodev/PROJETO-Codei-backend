import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'

export default class ProfileController {
    // Método para obter um perfil pelo userID
    public async show({ params, response }: HttpContextContract) {
        const userId = params.id  // Usando o 'id' da URL como o 'userId'
    
        try {
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
            return response.ok({ profile })
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
        const profileId = params.id

        // Verifique se o profileId está definido
        if (!profileId) {
            return response.badRequest({ error: 'ID do perfil não foi fornecido' })
        }

        const data = request.only(['photo', 'bio', 'technologies', 'friends', 'levels'])

        try {
            const profile = await Profile.findOrFail(profileId)
            profile.merge(data) // Atualiza os campos permitidos
            await profile.save()
            return response.ok({ profile })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao atualizar perfil', details: error.message })
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
            const userId = auth.user?.id

            if (!userId) {
                return response.unauthorized({ error: 'Usuário não autenticado' })
            }

            // Buscando o perfil pelo userId que agora é a chave primária
            let profile = await Profile.findBy('userId', userId)

            // Se o perfil não existir, crie um novo perfil vazio
            if (!profile) {
                profile = await Profile.create({
                    userId, // Usa userId como chave primária
                    photo: '',
                    bio: '',
                    technologies: [],
                    friends: [],
                    levels: []
                })
            }

            return response.ok({ profile })
        } catch (error) {
            return response.badRequest({ error: 'Erro ao obter ou criar perfil', details: error.message })
        }
    }

}    
