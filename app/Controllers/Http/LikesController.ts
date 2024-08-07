import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from 'App/Models/Like'

export default class LikesController {
  // Método para adicionar ou remover like
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
        return response.ok({ message: 'Like removido' });
      }
  
      // Se o like não existe, cria um novo
      const like = await Like.create({
        userId: user.id,
        momentId: momentId,
      });
  
      console.log('Like criado com sucesso');
      return response.created(like);
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
