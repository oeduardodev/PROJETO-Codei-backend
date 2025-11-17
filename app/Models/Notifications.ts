import { afterFetch, afterFind, BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public type: string

  @column()
  public read: boolean

  @column()
  public title: string

  @column()
  public message: string

  @column()
  public data: any

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @beforeSave()
  public static stringifyData(notification: Notification) {
    if (typeof notification.data === 'object') {
      notification.data = JSON.stringify(notification.data)
    }
  }

  @afterFetch()
  public static parseFetchedData(notifications: Notification[]) {
    notifications.forEach((n) => {
      if (typeof n.data === 'string') {
        try {
          n.data = JSON.parse(n.data)
        } catch {
          n.data = {}
        }
      }
    })
  }

  @afterFind()
  public static parseSingleData(notification: Notification) {
    if (typeof notification.data === 'string') {
      try {
        notification.data = JSON.parse(notification.data)
      } catch {
        notification.data = {}
      }
    }
  }
}
