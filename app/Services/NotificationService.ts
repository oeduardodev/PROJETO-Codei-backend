import Notification from "App/Models/Notifications"
import Ws from './ws'


class NotificationService {
  async send(userId: number, type: string, data: object) {
    const notification = await Notification.create({ userId, type, data })

    Ws.io.to(`user:${userId}`).emit('notification', notification)

    return notification
  }
}

export default new NotificationService()
