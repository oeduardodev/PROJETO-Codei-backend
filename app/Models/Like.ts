import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  public userId: number

  public id: number

  @column()
  public username: string

  @column()
  public qt: number

  @column()
  public momentId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
  total: number
}
