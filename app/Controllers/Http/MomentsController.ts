import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    // try {
    //   // Tenta autenticar o usuário
    //   await auth.use('api').authenticate()
    // } catch {
    //   // Retorna uma mensagem de erro se a autenticação falhar
    //   return response.status(401).json({
    //     message: 'Usuário não está logado. Por favor, faça o login para continuar.',
    //   })
    // }

    // // Obtém o usuário autenticado
    // const user = auth.user!

    // Obtém os dados do corpo da requisição
    const body = request.body()

    // Obtém o arquivo de imagem
    const image = request.file('image', this.validationOptions)

    // Se uma imagem foi fornecida, mova-a para o local correto
    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`

      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })

      body.image = imageName
    }

    // // Adiciona o ID do usuário autenticado ao corpo da requisição
    // body.user_id = user.id

    // Cria o momento no banco de dados
    const moment = await Moment.create(body)

    // Define o status de resposta como 201 (Criado)
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
    const moment = await Moment.findOrFail(params.id)

    await moment.load('comments')

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
