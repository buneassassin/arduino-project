import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import Mail from '@adonisjs/mail/services/main'
import crypto from 'crypto'
import axios from 'axios'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    /*const name = request.input('name')
    const email = request.input('email')
    const password = request.input('password')
    // verificamos si el correo ya esta registrado
    const user = await User.findBy('email', email)
    if (user) {
      return response.badRequest({ message: 'El correo ya esta registrado' })
    }

    const activationToken = crypto.randomUUID()
    await User.create({
      fullName: name,
      email,
      password,
      activation_token: activationToken,
    })
    const activationLink = `http://${process.env.HOST}:3336/activate-account?token=${activationToken}`
    /*await Mail.send((message) => {
      message
        .to(email)
        .from('info@example.org')
        .subject('Verify your email address')
        .htmlView('emails/verify_email_html', { activationLink })
    })
    await Mail.send((message) => {
      message.to(email).from('info@example.org').subject('Verify Your Email Address').html(`
          <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #007bff; text-align: center;">Email Verification</h2>
                <p style="font-size: 16px; line-height: 1.6;">Hi there,</p>
                <p style="font-size: 16px; line-height: 1.6;">Please click the link below to verify your email address:</p>
                <p style="text-align: center;">
                  <a href="${activationLink}" style="padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">Verify Email</a>
                </p>
                <p style="font-size: 14px; text-align: center; color: #888;">If you didn't request this, please ignore this email.</p>
              </div>
            </body>
          </html>
        `)
    })

    // Enviar el correo de activación
    /*    await Mail.send(new VerifyENotification({
      email: user.email,
      activation_token: user.activation_token,
    }))

    return response.ok({
      message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.',
    })*/

    const name = request.input('name')
    const email = request.input('email')
    const password = request.input('password')

    try {
      const user = await axios.post(
        `${process.env.API}/api/register`,
        {
          name: name,
          email: email,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return response.ok({
        message: user.data.message,
      })
    } catch (error) {
      console.log(error.response ? error.response.data : error.message)

      return response.status(error.response ? error.response.status : 500).send({
        message: error.response ? error.response.data : error.message,
      })
    }
  }

  public async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
        
      //  const user = await User.verifyCredentials(email, password)
      //return User.accessTokens.create(user)
      const user = await axios.post(`${process.env.API}/api/login`, {
        email: email,
        password: password,
      })
      return response.json(user.data) // Respuesta correcta del usuario
    } catch (error) {
      return response.unauthorized({ message: 'Credenciales incorrectas' })
    }
  }

  public async activateAccount({ request, response }: HttpContext) {
    const token = request.input('token')

    try {
      // Buscar al usuario usando el token de activación
      const user = await User.findBy('activation_token', token)

      if (!user) {
        return response.badRequest({ message: 'Token de activación inválido.' })
      }

      // Activar la cuenta
      user.is_active = true
      await user.save()

      // Obtener todos los administradores (usuarios con rol 3)
      const admins = await User.query().where('role_id', 3)

      // Enviar notificación a cada administrador
      admins.forEach(async (admin) => {
        await Mail.send((message) => {
          message.to(admin.email).from('info@example.org').subject('Cuenta activada').html(`
            <html>
              <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #007bff; text-align: center;">Cuenta Activada</h2>
                  <p style="font-size: 16px; line-height: 1.6;">La cuenta del usuario ${user.fullName} ha sido activada exitosamente.</p>
                  <p style="font-size: 16px; line-height: 1.6;">Detalles del usuario:</p>
                  <ul>
                    <li><strong>Nombre:</strong> ${user.fullName}</li>
                    <li><strong>Email:</strong> ${user.email}</li>
                    <li><strong>Fecha de Activación:</strong> ${new Date().toLocaleString()}</li>
                  </ul>
                </div>
              </body>
            </html>
          `)
        })
      })

      return response.ok({ message: 'Cuenta activada exitosamente.' })
    } catch (error) {
      return response.internalServerError({ message: 'Error al activar la cuenta', error })
    }
  }
  public async renvio({ response, request }: HttpContext) {
    /* const email = request.input('email')

    // Generar un nuevo token de activación
    const activationToken = crypto.randomUUID()
    // Actualizar el token de activación en la base de datos con el correo electrónico
    const user = await User.findByOrFail('email', email)
    if (!user) {
      return response.badRequest({ message: 'Cuenta no encontrada' })
    }
    user.activation_token = activationToken
    await user.save()

    const activationLink = `http://${process.env.HOST}:3336/activate-account?token=${activationToken}`

    await Mail.send((message) => {
      message.to(email).from('info@example.org').subject('Verify Your Email Address').html(`
          <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #007bff; text-align: center;">Email Verification</h2>
                <p style="font-size: 16px; line-height: 1.6;">Hi there,</p>
                <p style="font-size: 16px; line-height: 1.6;">Please click the link below to verify your email address:</p>
                <p style="text-align: center;">
                  <a href="${activationLink}" style="padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">Verify Email</a>
                </p>
                <p style="font-size: 14px; text-align: center; color: #888;">If you didn't request this, please ignore this email.</p>
              </div>
            </body>
          </html>
        `)
    })
    return response.ok({
      message: 'Reenviado exitoso. Por favor, revisa tu correo para verificar tu cuenta.',
    })*/
    const result = await axios.post(
      'https://d0cb-2806-101e-b-73f5-d920-d643-a77b-d371.ngrok-free.app/api/activation-link',
      {
        email: request.input('email'),
      }
    )

    return response.ok(result.data)
  }
}
