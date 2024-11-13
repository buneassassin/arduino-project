import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('winner').unsigned().nullable().references('users.id').onDelete('CASCADE');
      table.integer('turn').unsigned().nullable().references('users.id').onDelete('CASCADE')
      table.string('status').notNullable() // Por ejemplo, "in_progress", "completed"
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}