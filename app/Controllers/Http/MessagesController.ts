import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import NotificationService from 'App/Services/NotificationService'
import Ws from 'App/Services/ws'

export default class MessagesController {
  /*
   * Envia uma nova mensagem para um usuário específico.
   */
  public async sendMessages({ request, auth }: HttpContextContract) {
    const { receiver, content } = request.only(['receiver', 'content'])

    const message = await Message.create({
      senderId: auth.user!.id,
      receiverId: receiver,
      content,
    })

    Ws.io.to(receiver.toString()).emit('newMessage', message)
    Ws.io.to(auth.user!.id.toString()).emit('newMessage', message)

    // Enviar notificação para o dono do momento (se não for o próprio autor curtindo)

    await NotificationService.send(receiver, 'message', {
      senderId: auth.user!.id,
      receiverId: receiver,
      content,
    })

    return message
  }

  /*
   * Lista todas as mensagens em que o usuário autenticado está envolvido.
   */
  public async getMessages({ auth }: HttpContextContract) {
    const messages = await Message.query()
      .where('sender_id', auth.user!.id)
      .orWhere('receiver_id', auth.user!.id)
      .preload('sender')
      .preload('receiver')

    return messages
  }

  public async getMessagesById({ params, auth }) {
    const currentUserId = auth.user?.id
    const otherUserId = Number(params.id)

    const messages = await Message.query()
      .where((query) => {
        query.where('sender_id', currentUserId).andWhere('receiver_id', otherUserId)
      })
      .orWhere((query) => {
        query.where('sender_id', otherUserId).andWhere('receiver_id', currentUserId)
      })
      .preload('sender')
      .preload('receiver')
      .orderBy('created_at', 'asc')

    return messages
  }
}
