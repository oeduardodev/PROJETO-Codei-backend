import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public bio: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
