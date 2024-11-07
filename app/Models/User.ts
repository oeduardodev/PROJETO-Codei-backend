import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import Moments from './Moment'


export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column()
  public password: string

  @column({ columnName: 'admin' })
  public isAdmin: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Definindo o relacionamento com o perfil
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

    // Definindo o relacionamento com o perfil
    @hasOne(() => Moments)
    public moments: HasOne<typeof Moments>
  
}
