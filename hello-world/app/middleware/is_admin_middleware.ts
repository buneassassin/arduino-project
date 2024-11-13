import type { HttpContext } from '@adonisjs/core/http'

export default class IsAdminMiddleware {
  public async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    try {
      // Obtén el usuario autenticado
      const user = await auth.authenticate()

      // Verifica si el rol del usuario es 3 (Administrador)
      if (user.role_id !== 3) {
        // Cambia 401 Unauthorized a 403 Forbidden
        return response.forbidden({ message: 'No es Administrador.' })
      }

      // Si el rol es correcto, continúa con la solicitud
      await next()
    } catch (error) {
      // Si no está autenticado, devuelve 403 Forbidden
      return response.forbidden({ message: 'No estás autorizado.' })
    }
  }
}
