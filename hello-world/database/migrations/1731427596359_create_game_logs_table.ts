import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('games.id').onDelete('CASCADE')
      table.integer('jugador_1').unsigned().nullable().references('users.id').onDelete('CASCADE')
      table.integer('jugador_2').unsigned().nullable().references('users.id').onDelete('CASCADE')
      
      table.string('action').notNullable() // Descripción de la acción o evento
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}