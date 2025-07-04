import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'
import User from './User'
import Profile from './Profile'

export default class Moment extends BaseModel {
  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
  @belongsTo(() => Profile, {
    foreignKey: 'userId',
  })
  
  public profile: BelongsTo<typeof Profile>;
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
  