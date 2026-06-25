import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'app/Models/Message'
import User from 'app/Models/User'
import Ws from 'app/Services/ws'

export default class MessagesController {
  /*
   * Envia uma nova mensagem para um usuário específico.
   */
  public async sendMessages({ request, auth, response }: HttpContextContract) {
    const { receiver, content } = request.only(['receiver', 'content'])
    const receiverId = Number(receiver)
    const trimmedContent = String(content ?? '').trim()

    if (!receiverId || Number.isNaN(receiverId)) {
      return response.badRequest({ error: 'Destinatario invalido' })
    }

    if (!trimmedContent) {
      return response.badRequest({ error: 'Mensagem vazia' })
    }

    if (receiverId === auth.user!.id) {
      return response.badRequest({ error: 'Nao e possivel enviar mensagem para voce mesmo' })
    }

    const receiverUser = await User.find(receiverId)
    if (!receiverUser) {
      return response.notFound({ error: 'Destinatario nao encontrado' })
    }

    const message = await Message.create({
      senderId: auth.user!.id,
      receiverId,
      content: trimmedContent,
      read: false,
    })

    Ws.io.to(`user:${receiverId}`).emit('newMessage', message)
    Ws.io.to(`user:${auth.user!.id}`).emit('newMessage', message)

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

  public async getMessagesById({ params, auth, response }: HttpContextContract) {
    const currentUserId = auth.user!.id
    const otherUserId = Number(params.id)

    if (!otherUserId || Number.isNaN(otherUserId)) {
      return response.badRequest({ error: 'Usuario invalido' })
    }

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

  public async markAsRead({ params, auth, response }: HttpContextContract) {
    const currentUserId = auth.user!.id
    const otherUserId = Number(params.id)

    if (!otherUserId || Number.isNaN(otherUserId)) {
      return response.badRequest({ error: 'Usuario invalido' })
    }

    await Message.query()
      .where('sender_id', otherUserId)
      .andWhere('receiver_id', currentUserId)
      .andWhere('read', false)
      .update({ read: true })

    return { success: true }
  }
}
