import { DateTime } from 'luxon'
import { BaseModel, column,hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Game from '#models/game'
import User from '#models/user'
export default class Attack extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  /*table.integer('game_id').unsigned().references('games.id').onDelete('CASCADE')
      table.integer('attacker_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('target_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('position_x').notNullable()
      table.integer('position_y').notNullable()
      table.boolean('is_hit').defaultTo(false*/
  @column()
  declare game_id: number
  @column()
  declare attacker_id: number
  @column()
  declare targetid: number
  @column()
  declare position_x: number
  @column()
  declare position_y: number
  @column()
  declare is_hit: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Game)
  declare game: HasOne<typeof Game>
  @hasOne(() => User)
  declare user: HasOne<typeof User>


}
