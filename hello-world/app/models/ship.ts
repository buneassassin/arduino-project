import { DateTime } from 'luxon'
import { BaseModel, column,hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'
import User from '#models/user'
export default class Ship extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare game_id: number
  @column()
  declare user_id: number
  @column()
  declare position_x: number
  @column()
  declare position_y: number
  @column()
  declare is_sunk: boolean
  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Game)
  declare game: HasOne<typeof Game>
  @hasOne(() => User)
  declare user: HasOne<typeof User>
}