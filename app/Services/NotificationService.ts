import Notification from 'app/Models/Notifications'
import Ws from './ws'

type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_post'

type NotificationPayloadMap = {
  like: { likedBy: string }
  comment: { commentedBy: string }
  friend_request: { fromUsername: string }
  friend_post: { postedByUsername: string }
}

const messages: { [K in NotificationType]: (data: NotificationPayloadMap[K] & Record<string, unknown>) => { title: string; message: string } } = {
  like: (data) => ({
    title: 'Nova curtida!',
    message: `${data.likedBy} curtiu seu momento.`,
  }),
  comment: (data) => ({
    title: 'Novo comentário!',
    message: `${data.commentedBy} comentou no seu momento.`,
  }),
  friend_request: (data) => ({
    title: 'Novo pedido de amizade!',
    message: `${data.fromUsername} quer te adicionar como amigo.`,
  }),
  friend_post: (data) => ({
    title: 'Novo post de um amigo!',
    message: `${data.postedByUsername} acabou de postar um novo momento.`,
  }),
}

class NotificationService {
  async send<T extends NotificationType>(userId: number, type: T, data: NotificationPayloadMap[T] & Record<string, unknown>) {
    const { title, message } = messages[type](data)

    const notification = await Notification.create({
      userId,
      type,
      data: JSON.stringify(data),
      title,
      message,
      read: false,
    })

    try {
      Ws.io.to(`user:${userId}`).emit('notification', {
        ...notification.toJSON(),
        title,
        message,
      })
    } catch (error) {
      console.warn('Falha ao enviar notificação via WebSocket:', error)
    }

    return notification
  }
}

export default new NotificationService()

