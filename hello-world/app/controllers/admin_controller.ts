import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
export default class AdminController {
  public async cambiarloajugador({ request, response }: HttpContext) {
    const email = request.input('email')
    //verificamos si el correo existe
    const user = await User.findBy('email', email)
    if (!user) {
      return response.badRequest({ message: 'Cuenta no encontrada' })
    }
    // vereficamos si el usuario es un usuario normal
    if (user.role_id == 2) {
      return response.badRequest({ message: 'El usuario ya es un jugador' })
    }
    //verficamos si el usuario es un admin
    if (user.role_id == 3) {
      return response.badRequest({ message: 'El usuario es un admin' })
    }
    user.role_id = 2
    await user.save()
    return response.json({ message: 'Cuenta cambiada a jugador' })
  }
}
