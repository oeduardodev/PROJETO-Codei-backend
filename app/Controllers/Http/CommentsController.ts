import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'app/Models/Comment'
import Moment from 'app/Models/Moment'
import Profile from 'app/Models/Profile'

export default class CommentsController {
  /*
   * Adiciona um comentário a um momento específico
   */
  public async store({ request, response, params, auth }: HttpContextContract) {
    const body = request.only(['username', 'text', 'photo'])
    const momentId = params.id
    await Moment.findOrFail(momentId)

    let profile: Profile | null = null

    try {
      await auth.use('api').authenticate()
      profile = await Profile.query().where('userId', auth.user!.id).first()
    } catch {
      if (body.username) {
        profile = await Profile.query().where('username', body.username).first()
      }
    }

    const comment = await Comment.create({
      ...body,
      photo: body.photo ?? profile?.photo ?? null,
      momentId,
    })

    response.status(201)

    return {
      message: 'Comentário adicionado com sucesso!',
      data: comment,
    }
  }

  /*
   * Lista todos os comentários de um momento específico
   */
  public async showByMomentId({ params, response }: HttpContextContract) {
    const momentId = params.id

    try {
      const moment = await Moment.query()
        .where('id', momentId)
        .preload('comments', (commentQuery) => {
          commentQuery.select('id', 'username', 'photo', 'text')
        })
        .first()

      if (!moment) {
        return response.notFound({ error: 'Momento não encontrado' })
      }

      return response.ok({ comments: moment.comments })
    } catch (error) {
      return response.badRequest({ error: 'Erro ao buscar comentários', details: error.message })
    }
  }
}
