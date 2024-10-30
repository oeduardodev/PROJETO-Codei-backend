import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Profile extends BaseModel {
  @column({ isPrimary: true }) 
  public userId: number

  @column()
  public photo: string

  @column()
  public bio: string

  @column({
    serializeAs: 'technologies',
    prepare: (value: string[] | null) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : []),
  })
  public technologies: string[]

  @column({
    serializeAs: 'friends',
    prepare: (value: string[] | null) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : []),
  })
  public friends: string[]

  @column({
    serializeAs: 'levels',
    prepare: (value: string[] | null) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : []),
  })
  public levels: string[]

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
