import Notification from 'App/Models/Notifications'
import Ws from './ws'

type NotificationType = 'like' | 'comment' | 'friend_request' | 'friend_post'

export const messages = {
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
  default: () => ({
    title: 'Nova notificação',
    message: 'Você recebeu uma nova atualização.',
  }),
}

class NotificationService {
  async send(userId: number, type: NotificationType, data: Record<string, any>) {
    const { title, message } = (messages[type] || messages.default)(data)

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
