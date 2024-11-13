import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      { email: 'joses@example.com', password: '12345678', fullName: 'Administrador', role_id: 3, is_active: true },
      { email: 'manuels@example.com', password: '12345678', fullName: 'Jugador 1', role_id: 2, is_active: true },
      { email: 'javiers@example.com', password: '12345678', fullName: 'Jugador 2', role_id: 2, is_active: true },
    ])
  }
}