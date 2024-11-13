import axios from 'axios'

async function sendSlackMessage(message) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!slackWebhookUrl) {
    console.error('SLACK_WEBHOOK_URL no está configurado en el archivo .env')
    return
  }

  try {
    await axios.post(slackWebhookUrl, { text: message })
  } catch (error) {
    console.error('Error al enviar mensaje a Slack:', error)
  }
}
