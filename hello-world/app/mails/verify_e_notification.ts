import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  from = 'no-reply@example.com' // Dirección de correo del remitente
  subject = 'Activate your account' // Asunto del correo

  constructor(private user: { email: string; activation_token: string }) {
    super()
  }

  public prepare() {
    // Establecemos el destinatario del correo
    this.message.to(this.user.email)

    // Configuramos el contenido HTML del correo usando una vista Edge
    this.message.htmlView('emails/activate_account', {
      activationLink: `http://localhost:3333/activate-account?token=${this.user.activation_token}`,
    })
  }


  /**
   * El método "send" recibe el usuario y lo asigna al correo
   */
  
  public async send(user: any): Promise<any> {
    this.user = user
    await super.send(user) // Pass the user object to the send method
  }
}
