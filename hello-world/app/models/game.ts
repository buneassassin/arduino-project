import { DateTime } from 'luxon'
import { BaseModel, column,hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import GameLog from '#models/game_log'
import Ship from '#models/ship'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare status: string

  @column()
  declare winner: number

  @column()
  declare turn: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasOne(() => GameLog)
  declare gameLog: HasOne<typeof GameLog>
  @hasOne(() => Ship)
  declare ship: HasOne<typeof Ship>
  
}
