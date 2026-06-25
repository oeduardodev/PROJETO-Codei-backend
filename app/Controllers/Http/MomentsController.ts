import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import Moment from 'app/Models/Moment'
import Profile from 'app/Models/Profile'
import { randomUUID } from 'crypto'
import { uploadToCloudinary } from 'app/Services/CloudinaryService'
import fs from 'fs'
import NotificationService from 'app/Services/NotificationService'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '1mb',
  }

  private async uploadImage(image: any) {
    const imageName = `${randomUUID()}.${image.extname}`
    const uploadFolder = Application.tmpPath('uploads')
    const imagePath = `${uploadFolder}/${imageName}`

    await image.move(uploadFolder, { name: imageName, overwrite: true })

    const uploadResult = await uploadToCloudinary(imagePath)

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }

    return (uploadResult as any).secure_url
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const body = request.only(['title', 'description']) as any
    const image = request.file('image', this.validationOptions)
    const user = auth.user!

    if (!body.title || !body.description) {
      return response.badRequest({ error: 'Titulo e descricao sao obrigatorios' })
    }

    if (image) {
      body.image = await this.uploadImage(image)
    }

    const moment = await Moment.create({
      title: body.title,
      description: body.description,
      image: body.image,
      userId: user.id,
    })

    const profile = await Profile.query().where('userId', user.id).first()

    if (profile && Array.isArray(profile.friends) && profile.friends.length > 0) {
      for (const friendId of profile.friends) {
        await NotificationService.send(friendId, 'friend_post', {
          momentId: moment.id,
          postedById: user.id,
          postedByUsername: profile.username,
          message: `${profile.username} postou um novo momento!`,
        })
      }
    }

    response.status(201)
    return {
      message: 'Momento criado com sucesso!',
      data: moment,
    }
  }

  public async index() {
    const moments = await Moment.query().preload('comments')
    return {
      data: moments,
    }
  }

  public async show({ params }: HttpContextContract) {
    const moment = await Moment.query()
      .where('id', params.id)
      .preload('profile')
      .preload('comments')
      .firstOrFail()

    const serializedMoment = moment.serialize()

    return {
      data: {
        ...serializedMoment,
        profile: {
          username: moment.profile?.username,
          photo: moment.profile?.photo,
        },
      },
    }
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    if (moment.userId !== auth.user!.id) {
      return response.forbidden({ error: 'Voce nao pode excluir este momento' })
    }

    await moment.delete()

    return {
      message: 'Momento excluido com sucesso!',
      data: moment,
    }
  }

  public async update({ params, request, auth, response }: HttpContextContract) {
    const body = request.only(['title', 'description'])
    const moment = await Moment.findOrFail(params.id)

    if (moment.userId !== auth.user!.id) {
      return response.forbidden({ error: 'Voce nao pode alterar este momento' })
    }

    if (body.title) moment.title = body.title
    if (body.description) moment.description = body.description

    const image = request.file('image', this.validationOptions)
    if (image) {
      moment.image = await this.uploadImage(image)
    }

    await moment.save()

    return {
      message: 'Momento atualizado com sucesso!',
      data: moment,
    }
  }
}
