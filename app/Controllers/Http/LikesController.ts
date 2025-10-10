import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'App/Models/Like'
import Moment from 'App/Models/Moment'
import NotificationService from 'App/Services/NotificationService'

export default class LikesController {

  public async like({ params, auth, response }: HttpContextContract) {
    try {
      if (!auth.user) {
        return response.unauthorized({ message: 'Usuário não autenticado' });
      }
  
      const momentId = params.id; 
      const user = auth.user;
      const moment = await Moment.findOrFail(momentId);
  
      const existingLike = await Like
        .query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first();
  
      if (existingLike) {
        await existingLike.delete();
        moment.likesCount -= 1;
      } else {
        await Like.create({
          userId: user.id,
          momentId: momentId,
        });
        moment.likesCount += 1;

        // Enviar notificação para o dono do momento (se não for o próprio autor curtindo)
        if (moment.userId !== user.id) {
          await NotificationService.send(moment.userId, 'like', {
            momentId: moment.id,
            likedBy: user.username,
            likedById: user.id
          });
        }
      }
  
      await moment.save();
      return response.ok({ message: 'Operação de like/deslike realizada com sucesso' });
  
    } catch (error) {
      console.error(error)
      return response.internalServerError({ 
        message: 'Erro ao processar like', 
        error: error.message, 
        stack: error.stack 
      });
    }
  }

  /*
   * Verifica se o usuário já deu like em um momento específico
   */
  public async checkLike({ params, auth, response }: HttpContextContract) {
    try {
      await auth.use('api').authenticate();
  
      const momentId = params.id;
      const user = auth.user!;
  
      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first();
  
      return response.ok({ liked: !!existingLike });
    } catch (error) {
      console.error('Erro ao verificar like:', error);
      return response.internalServerError({
        message: 'Erro ao verificar like',
        error: error.message || error,
      });
    }
  }
}
