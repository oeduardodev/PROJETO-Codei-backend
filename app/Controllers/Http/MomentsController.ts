import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response, auth }: HttpContextContract) {
    
    //Obtem o corpo da requisição
    const body = request.body()
  
    const image = request.file('image', this.validationOptions)
  
    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`
  
      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })
  
      body.image = imageName
    }
  
    // Adiciona o ID do usuário autenticado ao corpo da requisição
    const user = auth.user!
    body.user_id = user.id
  
    const moment = await Moment.create(body)
  
    response.status(201)
  
    return {
      message: 'Momento criado com sucesso!',
      data: moment,
    }
  }
  
  public async index() {
    const moments = await Moment.query().preload('comments')
    // await auth.use('api').authenticate()

    return {
      data: moments,
    }
  }

  public async show({ params }: HttpContextContract) {
    const moment = await Moment.query()
      .where('id', params.id)
      .preload('user') 
      .preload('comments') 
      .firstOrFail()
  
    return {
      data: moment,
    }
  }
  

  public async destroy({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.delete()

    return {
      message: 'Momento excluído com sucesso!',
      data: moment,
    }
  }

  public async update({ params, request }: HttpContextContract) {
    const body = request.body()

    const moment = await Moment.findOrFail(params.id)

    moment.title = body.title
    moment.description = body.description

    if (moment.image !== body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuidv4()}.${image!.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

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
