import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import Moment from 'App/Models/Moment'

export default class CommentsController {
   
  /*
   * Adiciona um comentário a um momento específico
   */
  public async store({ request, response, params }: HttpContextContract) {

    const body = request.body()
    const momentId = params.momentId
    const comment = await Comment.create(body)
    await Moment.findOrFail(momentId)

    body.momentId = momentId
    
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
  const momentId = params.momentId;

  try {
    const moment = await Moment.query()
      .where('id', momentId) 
      .preload('comments', (commentQuery) => {
        commentQuery.select('id', 'username', 'photo', 'text'); 
      })
      .first();

    if (!moment) {
      return response.notFound({ error: 'Momento não encontrado' });
    }

    return response.ok({ comments: moment.comments });
  } catch (error) {
    return response.badRequest({ error: 'Erro ao buscar comentários', details: error.message });
  }
}



}
