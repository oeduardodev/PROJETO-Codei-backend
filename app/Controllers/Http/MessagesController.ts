import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import Ws from 'App/Services/ws'

export default class MessagesController {

  /*
   * Envia uma nova mensagem para um usuário específico.
   */
  public async send({ request, auth }: HttpContextContract) {
    const { receiverId, content } = request.only(['receiverId', 'content'])

    const message = await Message.create({
      senderId: auth.user!.id,
      receiverId,
      content,
    })

    Ws.io.to(receiverId.toString()).emit('newMessage', message)

    return message
  }

  /*
   * Lista todas as mensagens em que o usuário autenticado está envolvido.
   */
  public async index({ auth }: HttpContextContract) {
    const messages = await Message.query()
      .where('sender_id', auth.user!.id)
      .orWhere('receiver_id', auth.user!.id)
      .preload('sender')  
      .preload('receiver') 

    return messages
  }
}
