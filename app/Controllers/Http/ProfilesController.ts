import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import { v4 as uuidv4 } from 'uuid'
import { uploadToCloudinary } from 'App/Services/CloudinaryService'
import fs from 'fs'
import NotificationService from 'App/Services/NotificationService'
// Removed unused Application import
export default class ProfileController {
  /*
   *  Obtém o perfil do usuário autenticado e logado
   */
  public async me({ auth, response }: HttpContextContract) {
    try {
      const userId = auth.user!.id

      if (!userId) {
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      let profile = await Profile.query().where('userId', userId).preload('moments').first()

      if (!profile) {
        profile = await Profile.create({
          userId,
          photo: '',
          bio: '',
          technologies: [],
          friends: [],
          levels: [],
          username: auth.user!.username || 'default_username',
        })
      }

      return response.ok({ profile })
    } catch (error) {
      return response.badRequest({ error: 'Erro ao obter ou criar perfil', details: error.message })
    }
  }

  /*
   *  Lista todos os perfis
   */
  public async show({ params, response }: HttpContextContract) {
    const userId = params.id

    try {
      const profile = await Profile.query().where('userId', userId).preload('moments').first()

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
    const data = request.only([
      'userId',
      'photo',
      'bio',
      'technologies',
      'friends',
      'levels',
      'username',
    ])

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
    const profileId = params.id

    if (!profileId) {
      return response.badRequest({ error: 'ID do perfil não foi fornecido' })
    }

    const data = request.only(['photo', 'bio', 'technologies', 'friends', 'levels', 'username'])

    // Corrige campos que podem vir como string JSON
    const parseJSONField = (field: any) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field)
        } catch {
          return []
        }
      }
      return field
    }

    data.technologies = parseJSONField(data.technologies)
    data.friends = parseJSONField(data.friends)
    data.levels = parseJSONField(data.levels)

    try {
      const profile = await Profile.findOrFail(profileId)

      const updateData: Partial<typeof profile> = {}

      const imageFile = request.file('photo')

      if (imageFile) {
        const imageName = `${uuidv4()}.${imageFile.extname}`
        const uploadFolder = process.env.TMP_PATH || 'tmp/uploads'
        const imagePath = `${uploadFolder}/${imageName}`

        await imageFile.move(uploadFolder, { name: imageName, overwrite: true })

        const uploadResult = await uploadToCloudinary(imagePath)
        updateData.photo = (uploadResult as any).secure_url

        fs.unlinkSync(imagePath)
      }

      if (data.bio) updateData.bio = data.bio
      if (data.username) updateData.username = data.username
      if (Array.isArray(data.technologies) && data.technologies.length)
        updateData.technologies = data.technologies
      if (Array.isArray(data.friends) && data.friends.length) updateData.friends = data.friends
      if (Array.isArray(data.levels) && data.levels.length) updateData.levels = data.levels

      if (Object.keys(updateData).length === 0) {
        return response.ok({ message: 'Nenhum campo alterado', profile })
      }

      profile.merge(updateData)
      await profile.save()

      return response.ok({ message: 'Perfil atualizado com sucesso', profile })
    } catch (error) {
      return response.badRequest({ error: 'Erro ao atualizar perfil', details: error.message })
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
  public async addFriend({ auth, request, response }: HttpContextContract) {
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ error: 'Usuário não autenticado' })
    }

    const { friendId } = request.only(['friendId'])
    const normalizedFriendId = Number(friendId)
    if (Number.isNaN(normalizedFriendId)) {
      return response.badRequest({ error: 'friendId inválido' })
    }

    try {
      const myProfile = await Profile.query().where('userId', userId).firstOrFail()
      const currentFriends = Array.isArray(myProfile.friends) ? myProfile.friends.map(Number) : []

      // Evita duplicar amizade
      if (!currentFriends.includes(normalizedFriendId)) {
        myProfile.friends.push(normalizedFriendId)
        await myProfile.save()
      }

      // Envia notificação para o usuário que está sendo adicionado
      await NotificationService.send(normalizedFriendId, 'friend_request', {
        fromUserId: myProfile.userId,
        fromUsername: myProfile.username,
      })

      return response.ok({
        message: 'Convite de amizade enviado com sucesso',
        friends: myProfile.friends,
      })
    } catch (error) {
      return response.badRequest({
        error: 'Erro ao adicionar amigo',
        details: error.message,
      })
    }
  }

  /*
   *  Remove amigo
   */
  public async removeFriend({ auth, params, response }: HttpContextContract) {
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ error: 'Usuário não autenticado' })
    }

    const rawFriendId = params.friendId
    const friendId = Number(rawFriendId)

    if (Number.isNaN(friendId)) {
      return response.badRequest({ error: 'friendId inválido' })
    }

    try {
      const profile = await Profile.query().where('userId', userId).firstOrFail()

      // Garante que é um array
      const current = Array.isArray(profile.friends) ? profile.friends : []

      // Converte todos para número antes de filtrar
      profile.friends = current.map((f) => Number(f)).filter((f) => f !== friendId)

      await profile.save()

      return response.ok({
        message: 'Amigo removido com sucesso',
        friends: profile.friends,
      })
    } catch (error) {
      return response.badRequest({
        error: 'Erro ao remover amigo',
        details: error.message,
      })
    }
  }

  /*
   *  Lista todos os amigos
   */
  public async listFriends({ auth, response }: HttpContextContract) {
    const userId = auth.user!.id

    if (!userId) {
      return response.unauthorized({ error: 'Usuário não autenticado' })
    }

    try {
      const profile = await Profile.findOrFail(userId)
      const friendIds = Array.isArray(profile.friends) ? profile.friends.map(String) : []

      const friends = await Profile.query().whereIn('userId', friendIds)

      const myFriends = friends.filter((friend) => {
        const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : []
        return friendList.includes(String(userId))
      })

      return response.ok({ myFriends })
    } catch (error) {
      return response.badRequest({ error: 'Erro ao listar amigos', details: error.message })
    }
  }

  /*
   *  Lista amigos de um usuário pelo ID
   */
  public async listFriendsByID({ params, response }: HttpContextContract) {
    const userId = params.userId || params.id

    if (!userId) {
      return response.badRequest({ error: 'ID do usuário não foi fornecido' })
    }

    try {
      const profile = await Profile.find(userId)

      if (!profile) {
        return response.notFound({ error: 'Perfil não encontrado' })
      }

      const friendIds = profile.friends.map(String)
      const friends = await Profile.query().whereIn('userId', friendIds)

      const myFriends = friends.filter((friend) => {
        const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : []
        return friendList.includes(String(userId))
      })

      return response.ok({ myFriends })
    } catch (error) {
      return response.badRequest({ error: 'Erro ao listar amigos', details: error.message })
    }
  }
}
