import Notification from "App/Models/Notifications"
import ws from "App/Services/ws"

type NotificationType = 'like' | 'friend_request' | 'friend_post' | 'comment'

export default class NotificationService {
  public static async send(
    userId: number,
    type: NotificationType,
    data: Record<string, any>
  ) {
    let title = ''
    let message = ''

    switch (type) {
      case 'like':
        title = 'Nova curtida!'
        message = `${data.likedBy} curtiu seu momento.`
        break

      case 'friend_request':
        title = 'Novo pedido de amizade!'
        message = `${data.fromUsername} quer te adicionar como amigo.`
        break

      case 'friend_post':
        title = 'Novo post de um amigo!'
        message = `${data.postedByUsername} acabou de postar um novo momento.`
        break

      case 'comment':
        title = 'Novo comentário!'
        message = `${data.commentedBy} comentou no seu momento.`
        break

      default:
        title = 'Nova notificação'
        message = 'Você recebeu uma nova atualização.'
    }

    const notification = await Notification.create({
      userId,
      type,
      data: data,
      read: false,
    })

    try {
      ws.io.to(`user:${userId}`).emit('notification:new', notification)
    } catch (error) {
      console.warn('Ops... não conseguimos enviar a notificação', error)
    }

    return notification
  }
}