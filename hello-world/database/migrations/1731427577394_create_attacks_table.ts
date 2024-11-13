import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('games.id').onDelete('CASCADE')
      table.integer('attacker_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('target_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('position_x').notNullable()
      table.integer('position_y').notNullable()
      table.boolean('is_hit').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}