import Notification from 'App/Models/Notifications'

export default class NotificationsController {
  // Listar todas as notificações do usuário autenticado
  public async index({ auth }) {
    return Notification.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
  }

  public async markAsRead({ auth, request }) {
    const { id } = request.only(['id'])

    const notification = await Notification.query()
      .where('id', id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    notification.read = true
    await notification.save()

    return { success: true, notification }
  }
}
