import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Moment from './Moment'

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

  @hasMany(() => Moment, { foreignKey: 'userId' })
  public moments: HasMany<typeof Moment>
}
