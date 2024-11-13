import { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import Drive from '@adonisjs/drive/services/main'

interface FileValidationOptions {
  types: string[]
  size: string
}
const __dirname = dirname(new URL(import.meta.url).pathname)

export default class FileUploadsController {

  public async upload({ request, response }: HttpContext) {
    const validationOptions: FileValidationOptions = {
      types: ['image'],
      size: '2mb',
    }

    const image = request.file('image', validationOptions)

    if (!image) {
      return response.badRequest('No image uploaded')
    }

    // Asegúrate de que la carpeta existe (si no, créala)
    const directory = '23170153'

    // Genera un nombre único para la imagen
    const imageName = `${new Date().getTime()}-${image.clientName}`
    const imageBuffer = await readFile(image.tmpPath!)

    const u = Drive.use('spaces').put(directory, imageBuffer, {
      contentType: image.headers['content-type'],
    })
    const urlnew = Drive.use('spaces').getUrl(imageName);
    const result = await image.moveToDisk(directory, {
      name: image,
      driver: 'spaces',
    })

    // Usa el disco configurado en config/drive.ts (spaces)
  /*  await image.moveToDisk(directory, {
      name: imageName,
      driver: 'spaces',
    })

    // Devuelve la URL pública de la imagen subida
    //const fileUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}/${directory}/${imageName}`
  
    // Obtener el usuario autenticado
    const user = auth.user

    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    // Guardar la URL en la base de datos
    user.profile_image = urlnew
    await user.save()*/

    return response.ok({
      message: 'File uploaded successfully',
      url:  urlnew,
      u: u,
      result: result
    })
  }
  public async ver({ response, auth }: HttpContext) {
    // Verificar si el usuario está autenticado
    try {
      await auth.check()
    } catch (error) {
      return response.unauthorized('User not authenticated')
    }

    // Obtener el usuario autenticado
    const user = auth.user

    // Verificar si el usuario tiene una imagen de perfil almacenada
    if (!user?.profile_image) {
      return response.notFound('Profile image not found')
    }

    // Obtener la ruta completa del archivo
    const imagePath = join(__dirname, '..', '..', 'public', user.profile_image)

    // Leer el archivo de imagen
    const file = await readFile(imagePath)

    // Determinar el tipo de archivo (imagen)
    const fileExtension = user.profile_image.split('.').pop()?.toLowerCase()

    // Establecer el tipo de contenido en base a la extensión
    const mimeType =
      fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' : `image/${fileExtension}`

    // Configurar los encabezados de la respuesta
    response.header('Content-Type', mimeType)
    response.header('Cache-Control', 'public, max-age=31536000')

    // Devolver la imagen
    return response.send(file)

    
  }
  
}
