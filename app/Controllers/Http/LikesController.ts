import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'App/Models/Like'
import Moment from 'App/Models/Moment'

export default class LikesController {
  public async like({ params, auth, response }: HttpContextContract) {
    console.log('Iniciando o processo de adicionar/remover like');
    try {
      await auth.use('api').authenticate();
      console.log('Usuário autenticado com sucesso');

      const momentId = params.momentId;
      console.log(`Moment ID: ${momentId}`);

      const user = auth.user!;
      console.log(`Usuário ID: ${user.id}`);

      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first();

      if (existingLike) {
        // Se o like já existe, remove-o
        await existingLike.delete();
        console.log('Like removido com sucesso');
      } else {
        // Se o like não existe, cria um novo
        await Like.create({
          userId: user.id,
          momentId: momentId,
        });
        console.log('Like criado com sucesso');
      }

      // Atualiza a contagem de likes no momento
      const moment = await Moment.findOrFail(momentId);
      const likeCount = await Like.query().where('moment_id', momentId).count('* as total');

      // Acessando a contagem corretamente a partir de `$extras`
      const totalLikes = likeCount[0].$extras.total;
      
      console.log(`Contagem de likes para o momento ${momentId}:`, totalLikes);
      
      // Atualizando o momento com a contagem correta
      moment.likesCount = Number(totalLikes) || 0;
      await moment.save();
      
      await moment.save();
      
      
      await moment.save();

      return response.ok({ message: 'Operação de like/deslike realizada com sucesso' });
    } catch (error) {
      console.error('Erro ao processar like:', error);
      return response.internalServerError({ message: 'Erro ao processar like', error });
    }
  }

  // Método para verificar se o like existe
  public async checkLike({ params, auth, response }: HttpContextContract) {
    console.log('Iniciando verificação de like');
    try {
      await auth.use('api').authenticate();
      console.log('Usuário autenticado com sucesso');

      const momentId = params.momentId;
      console.log(`Moment ID: ${momentId}`);

      const user = auth.user!;
      console.log(`Usuário ID: ${user.id}`);

      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('moment_id', momentId)
        .first();

      if (existingLike) {
        console.log('Like encontrado');
        return response.ok({ liked: true });
      }
      console.log('Like não encontrado');
      return response.ok({ liked: false });
    } catch (error) {
      console.error('Erro ao verificar like:', error);
      return response.internalServerError({ message: 'Erro ao verificar like', error });
    }
  }
}
