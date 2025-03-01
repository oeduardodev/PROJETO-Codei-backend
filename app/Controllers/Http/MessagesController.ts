import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import Ws from 'App/Services/ws'

export default class MessagesController {
  public async send({ request, auth }: HttpContextContract) {
    const { receiverId, content } = request.only(['receiverId', 'content'])

    // Salvar a mensagem no banco de dados
    const message = await Message.create({
      senderId: auth.user!.id,
      receiverId,
      content,
    })

    // Emitir a mensagem para o cliente de destino via WebSocket
    Ws.io.to(receiverId.toString()).emit('novaMensagem', message)

    return message
  }

  public async index({ auth }: HttpContextContract) {
    const messages = await Message.query()
      .where('sender_id', auth.user!.id)
      .orWhere('receiver_id', auth.user!.id)
      .preload('sender')
      .preload('receiver')

    return messages
  }
}
