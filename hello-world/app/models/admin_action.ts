import { DateTime } from 'luxon'
import { BaseModel, column,hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
export default class AdminAction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare admin_id: number

  @column()
  declare action: string

  @column()
  declare details: string

  @column()
  declare performed_at: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => User)
  declare user: HasOne<typeof User>
}