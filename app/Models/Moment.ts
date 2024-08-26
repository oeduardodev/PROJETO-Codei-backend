import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'
import User from './User'

export default class Moment extends BaseModel {
  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number  

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public image: string

  @column()
  public likesCount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
  