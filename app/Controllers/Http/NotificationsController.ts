import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'app/Models/Notifications'

export default class NotificationsController {
  public async index({ auth }: HttpContextContract) {
    return Notification.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
  }

  public async markAsRead({ auth, request, response }: HttpContextContract) {
    const id = Number(request.input('id'))

    if (!id || Number.isNaN(id)) {
      return response.badRequest({ message: 'ID da notificacao e obrigatorio' })
    }

    const notification = await Notification.query()
      .where('id', id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    notification.read = true
    await notification.save()

    return { success: true, notification }
  }

  public async clearNotification({ auth, request, response }: HttpContextContract) {
    return this.markAsRead({ auth, request, response } as HttpContextContract)
  }
}
