import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import Profile from 'app/Models/Profile'
import { randomUUID } from 'crypto'
import { uploadToCloudinary } from 'app/Services/CloudinaryService'
import fs from 'fs'
import NotificationService from 'app/Services/NotificationService'

export default class ProfileController {
  private imageValidationOptions = {
    types: ['image'],
    size: '1mb',
  }

  private parseArrayField(field: unknown) {
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    return Array.isArray(field) ? field : []
  }

  public async search({ request, response }: HttpContextContract) {
    const term = String(request.input('term', '')).trim().toLowerCase()

    if (!term) {
      return response.ok({ profiles: [] })
    }

    if (term.length > 60) {
      return response.badRequest({ error: 'Termo de busca muito longo' })
    }

    try {
      const likeTerm = `%${term}%`

      const profiles = await Profile.query()
        .where((query) => {
          query
            .whereRaw('LOWER(username) LIKE ?', [likeTerm])
            .orWhereRaw('LOWER(bio) LIKE ?', [likeTerm])
            .orWhereRaw('LOWER(technologies) LIKE ?', [likeTerm])
        })
        .limit(20)

      return response.ok({ profiles })
    } catch {
      return response.badRequest({ error: 'Erro ao buscar perfis' })
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    try {
      const userId = auth.user!.id

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
    } catch {
      return response.badRequest({ error: 'Erro ao obter ou criar perfil' })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const profile = await Profile.query().where('userId', params.id).preload('moments').first()

      if (!profile) {
        return response.notFound({ error: 'Perfil nao encontrado' })
      }

      return response.ok({ profile })
    } catch {
      return response.badRequest({ error: 'Erro ao buscar perfil' })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const data = request.only(['photo', 'bio', 'technologies', 'levels', 'username'])

    try {
      const existingProfile = await Profile.find(auth.user!.id)
      if (existingProfile) {
        return response.badRequest({ error: 'Perfil ja existe' })
      }

      const profile = await Profile.create({
        userId: auth.user!.id,
        photo: data.photo ?? '',
        bio: data.bio ?? '',
        technologies: this.parseArrayField(data.technologies),
        friends: [],
        levels: this.parseArrayField(data.levels),
        username: data.username ?? auth.user!.username,
      })

      return response.created({ profile })
    } catch {
      return response.badRequest({ error: 'Erro ao criar perfil' })
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const profileId = Number(params.id)

    if (!profileId) {
      return response.badRequest({ error: 'ID do perfil nao foi fornecido' })
    }

    if (profileId !== auth.user!.id) {
      return response.forbidden({ error: 'Voce nao pode alterar este perfil' })
    }

    const data = request.only(['bio', 'technologies', 'levels', 'username'])

    try {
      const profile = await Profile.findOrFail(profileId)
      const updateData: Partial<Profile> = {}
      const imageFile = request.file('photo', this.imageValidationOptions)

      if (imageFile) {
        const imageName = `${randomUUID()}.${imageFile.extname}`
        const uploadFolder = Application.tmpPath('uploads')
        const imagePath = `${uploadFolder}/${imageName}`

        await imageFile.move(uploadFolder, { name: imageName, overwrite: true })

        const uploadResult = await uploadToCloudinary(imagePath)
        updateData.photo = (uploadResult as any).secure_url

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      if (typeof data.bio === 'string') updateData.bio = data.bio
      if (typeof data.username === 'string' && data.username.trim()) {
        updateData.username = data.username.trim()
      }
      if (data.technologies !== undefined) {
        updateData.technologies = this.parseArrayField(data.technologies)
      }
      if (data.levels !== undefined) {
        updateData.levels = this.parseArrayField(data.levels)
      }

      if (Object.keys(updateData).length === 0) {
        return response.ok({ message: 'Nenhum campo alterado', profile })
      }

      profile.merge(updateData)
      await profile.save()

      return response.ok({ message: 'Perfil atualizado com sucesso', profile })
    } catch {
      return response.badRequest({ error: 'Erro ao atualizar perfil' })
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const profileId = Number(params.id)

    if (profileId !== auth.user!.id) {
      return response.forbidden({ error: 'Voce nao pode deletar este perfil' })
    }

    try {
      const profile = await Profile.findOrFail(profileId)
      await profile.delete()
      return response.ok({ message: 'Perfil deletado com sucesso' })
    } catch {
      return response.badRequest({ error: 'Erro ao deletar perfil' })
    }
  }

  public async addFriend({ auth, request, response }: HttpContextContract) {
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ error: 'Usuario nao autenticado' })
    }

    const { friendId } = request.only(['friendId'])
    const normalizedFriendId = Number(friendId)

    if (!normalizedFriendId || Number.isNaN(normalizedFriendId)) {
      return response.badRequest({ error: 'friendId invalido' })
    }

    if (normalizedFriendId === userId) {
      return response.badRequest({ error: 'Voce nao pode adicionar a si mesmo' })
    }

    try {
      const myProfile = await Profile.query().where('userId', userId).firstOrFail()
      const friendProfile = await Profile.query().where('userId', normalizedFriendId).first()

      if (!friendProfile) {
        return response.notFound({ error: 'Perfil do amigo nao encontrado' })
      }

      const currentFriends = Array.isArray(myProfile.friends) ? myProfile.friends.map(Number) : []

      if (!currentFriends.includes(normalizedFriendId)) {
        myProfile.friends = [...currentFriends, normalizedFriendId]
        await myProfile.save()
      }

      await NotificationService.send(normalizedFriendId, 'friend_request', {
        fromUserId: myProfile.userId,
        fromUsername: myProfile.username,
      })

      return response.ok({
        message: 'Convite de amizade enviado com sucesso',
        friends: myProfile.friends,
      })
    } catch {
      return response.badRequest({ error: 'Erro ao adicionar amigo' })
    }
  }

  public async removeFriend({ auth, params, response }: HttpContextContract) {
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ error: 'Usuario nao autenticado' })
    }

    const friendId = Number(params.friendId)

    if (!friendId || Number.isNaN(friendId)) {
      return response.badRequest({ error: 'friendId invalido' })
    }

    try {
      const profile = await Profile.query().where('userId', userId).firstOrFail()
      const current = Array.isArray(profile.friends) ? profile.friends : []

      profile.friends = current
        .map((friend) => Number(friend))
        .filter((friend) => friend !== friendId)

      await profile.save()

      return response.ok({
        message: 'Amigo removido com sucesso',
        friends: profile.friends,
      })
    } catch {
      return response.badRequest({ error: 'Erro ao remover amigo' })
    }
  }

  public async listFriends({ auth, response }: HttpContextContract) {
    const userId = auth.user!.id

    try {
      const profile = await Profile.findOrFail(userId)
      const friendIds = Array.isArray(profile.friends) ? profile.friends.map(String) : []
      const friends = await Profile.query().whereIn('userId', friendIds)

      const myFriends = friends.filter((friend) => {
        const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : []
        return friendList.includes(String(userId))
      })

      return response.ok({ myFriends })
    } catch {
      return response.badRequest({ error: 'Erro ao listar amigos' })
    }
  }

  public async listFriendsByID({ params, response }: HttpContextContract) {
    const userId = params.userId || params.id

    if (!userId) {
      return response.badRequest({ error: 'ID do usuario nao foi fornecido' })
    }

    try {
      const profile = await Profile.find(userId)

      if (!profile) {
        return response.notFound({ error: 'Perfil nao encontrado' })
      }

      const friendIds = Array.isArray(profile.friends) ? profile.friends.map(String) : []
      const friends = await Profile.query().whereIn('userId', friendIds)

      const myFriends = friends.filter((friend) => {
        const friendList = Array.isArray(friend.friends) ? friend.friends.map(String) : []
        return friendList.includes(String(userId))
      })

      return response.ok({ myFriends })
    } catch {
      return response.badRequest({ error: 'Erro ao listar amigos' })
    }
  }
}
