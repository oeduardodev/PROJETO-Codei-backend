import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'app/Models/Like'
import Moment from 'app/Models/Moment'
import NotificationService from 'app/Services/NotificationService'

export default class LikesController {
  public async like({ params, auth, response }: HttpContextContract) {
    try {
      const momentId = Number(params.id)
      const user = auth.user

      if (!user) {
        return response.unauthorized({ message: 'Usuario nao autenticado' })
      }

      if (!momentId || Number.isNaN(momentId)) {
        return response.badRequest({ error: 'Momento invalido' })
      }

      const moment = await Moment.findOrFail(momentId)

      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first()

      if (existingLike) {
        await existingLike.delete()
        moment.likesCount = Math.max(0, moment.likesCount - 1)
      } else {
        await Like.create({
          userId: user.id,
          momentId,
        })
        moment.likesCount += 1

        if (moment.userId !== user.id) {
          await NotificationService.send(moment.userId, 'like', {
            momentId: moment.id,
            likedBy: user.username,
            likedById: user.id,
          })
        }
      }

      await moment.save()
      return response.ok({ message: 'Operacao de like/deslike realizada com sucesso' })
    } catch (error) {
      console.error('Erro ao processar like:', error)
      return response.internalServerError({ message: 'Erro ao processar like' })
    }
  }

  public async checkLike({ params, auth, response }: HttpContextContract) {
    try {
      await auth.use('api').authenticate()

      const momentId = Number(params.id)
      const user = auth.user!

      if (!momentId || Number.isNaN(momentId)) {
        return response.badRequest({ error: 'Momento invalido' })
      }

      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first()

      return response.ok({ liked: !!existingLike })
    } catch (error) {
      console.error('Erro ao verificar like:', error)
      return response.internalServerError({ message: 'Erro ao verificar like' })
    }
  }
}
