import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'App/Models/Like'

export default class LikesController {
  public async like({ params, auth, response }: HttpContextContract) {
    try {
      // Verifica se o usuário está autenticado
      await auth.use('api').authenticate()

      // Obtém o ID do momento da rota
      const momentId = params.momentId

      // Obtém o usuário autenticado
      const user = auth.user!

      // Verifica se o usuário já curtiu o momento
      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first()

      if (existingLike) {
        return response.badRequest({ message: 'Você já curtiu este momento' })
      }

      // Cria o like
      const like = await Like.create({
        userId: user.id,
        momentId: momentId,
      })

      return response.created(like)
    } catch (error) {
      console.error('Erro ao adicionar like:', error)
      return response.internalServerError({ message: 'Erro ao adicionar like', error })
    }
  }
}
