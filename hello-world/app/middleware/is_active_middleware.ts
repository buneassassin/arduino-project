import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class IsActiveMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
      //sacamos el email
      const email = request.input('email')
      // Obtenemos el usuario autenticado
      const user = await User.findByOrFail('email', email)
     

      // Verifica si esta activado
      if (user.is_active == false) {
        return response.forbidden({ message: 'No estas activado su cuenta.' })
       
      }

      // Si el rol es correcto, continúa con la solicitud
      await next()
  
  }
}