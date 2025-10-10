import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'
import { uploadToCloudinary } from 'App/Services/CloudinaryService'
import fs from 'fs'
import NotificationService from 'App/Services/NotificationService'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '1mb',
  }

  /*
   * Cria um novo momento e salva no banco de dados
   */
  public async store({ request, response, auth }: HttpContextContract) {
    const body = request.body()
    const image = request.file('image', this.validationOptions)
    const user = auth.user!

    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`
      const uploadFolder = Application.tmpPath('uploads')
      const imagePath = `${uploadFolder}/${imageName}`

      await image.move(uploadFolder, { name: imageName, overwrite: true })

      const uploadResult = await uploadToCloudinary(imagePath)
      body.image = (uploadResult as any).secure_url

      fs.unlinkSync(imagePath)
    }

    body.user_id = user.id

    const moment = await Moment.create(body)

    const Profile = (await import('App/Models/Profile')).default
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

  /*
   * Retorna uma lista de todos os momentos
   */
  public async index() {
    const moments = await Moment.query().preload('comments')
    return {
      data: moments,
    }
  }

  /*
   * Retorna os detalhes de um momento específico
   */
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

  /*
   * Exclui um momento do banco de dados
   */
  public async destroy({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)
    await moment.delete()

    return {
      message: 'Momento excluído com sucesso!',
      data: moment,
    }
  }

  /*
   * Atualiza os dados de um momento existente
   */
  public async update({ params, request }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.findOrFail(params.id)

    moment.title = body.title
    moment.description = body.description

    if (moment.image !== body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)
      if (image) {
        const imageName = `${uuidv4()}.${image!.extname}`
        await image.move(Application.tmpPath('uploads'), { name: imageName })
        moment.image = imageName
      }
    }

    await moment.save()

    return {
      message: 'Momento atualizado com sucesso!',
      data: moment,
    }
  }
}
