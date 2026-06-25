import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'app/Models/Comment'
import Moment from 'app/Models/Moment'
import Profile from 'app/Models/Profile'

export default class CommentsController {
  public async store({ request, response, params, auth }: HttpContextContract) {
    const text = String(request.input('text', '')).trim()
    const momentId = params.id

    if (!text) {
      return response.badRequest({ error: 'Comentario vazio' })
    }

    await Moment.findOrFail(momentId)
    await auth.use('api').authenticate()

    const profile: Profile | null = await Profile.query().where('userId', auth.user!.id).first()

    const comment = await Comment.create({
      username: profile?.username ?? auth.user!.username,
      text,
      photo: profile?.photo || '',
      momentId,
    })

    response.status(201)

    return {
      message: 'Comentario adicionado com sucesso!',
      data: comment,
    }
  }

  public async showByMomentId({ params, response }: HttpContextContract) {
    try {
      const moment = await Moment.query()
        .where('id', params.id)
        .preload('comments', (commentQuery) => {
          commentQuery.select('id', 'username', 'photo', 'text')
        })
        .first()

      if (!moment) {
        return response.notFound({ error: 'Momento nao encontrado' })
      }

      return response.ok({ comments: moment.comments })
    } catch {
      return response.badRequest({ error: 'Erro ao buscar comentarios' })
    }
  }
}
