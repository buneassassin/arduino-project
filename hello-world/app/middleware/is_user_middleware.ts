import type { HttpContext } from '@adonisjs/core/http'

export default class IsUserMiddleware {
  public async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    try {
      // Obtén el usuario autenticado
      const user = await auth.authenticate()

      // Verifica si el rol del usuario es 2 (Usuario común)
      if (user.role_id !== 2) {
        return response.forbidden({ message: 'No tienes permisos de usuario.' })
      }

      // Si el rol es correcto, continúa con la solicitud
      await next()
    } catch (error) {
      return response.unauthorized({ message: 'No estás autorizado.' })
    }
  }
}