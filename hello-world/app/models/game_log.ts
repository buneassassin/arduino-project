import { DateTime } from 'luxon'
import { BaseModel, column,hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'
import User from '#models/user'
export default class GameLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare jugador1: number

  @column()
  declare jugador2: number

  @column()
  declare action: string

  @column()
  declare loggedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Game)
  declare game: HasOne<typeof Game>
  @hasOne(() => User)
  declare user: HasOne<typeof User>
}