import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'App/Models/Like'
import Moment from 'App/Models/Moment'

export default class LikesController {

  /*
   * Adiciona ou remove um like em um momento específico
   */
  public async like({ params, auth, response }: HttpContextContract) {
    try {
      if (!auth.user) {
        return response.unauthorized({ message: 'Usuário não autenticado' });
      }
  
      const momentId = params.momentId;
      const user = auth.user;
      const moment = await Moment.findOrFail(momentId);
  
      const existingLike = await Like.query().where('user_id', user.id).where('moment_id', momentId).first();
  
      if (existingLike) {
        await existingLike.delete();
        moment.likesCount -= 1; 
      } else {
        await Like.create({
          userId: user.id,
          momentId: momentId,
        });
        moment.likesCount += 1; 
      }
  
      await moment.save();
      return response.ok({ message: 'Operação de like/deslike realizada com sucesso' });
  
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao processar like', error });
    }
  }
  

  /*
   * Verifica se o usuário já deu like em um momento específico
   */
  public async checkLike({ params, auth, response }: HttpContextContract) {
    try {
      await auth.use('api').authenticate();

      const momentId = params.momentId;
      const user = auth.user!;
      
      const existingLike = await Like.query().where('user_id', user.id).where('moment_id', momentId).first();

      if (existingLike) {
        return response.ok({ liked: true });
      }
      return response.ok({ liked: false });
    } catch (error) {
      return response.internalServerError({ message: 'Erro ao verificar like', error });
    }
  }
}
