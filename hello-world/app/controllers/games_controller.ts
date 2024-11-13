import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import GameLog from '#models/game_log'
import Attack from '#models/attack'
import Ship from '#models/ship'
import axios from 'axios'

export default class GamesController {
  public async createGame({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const userId = user.id
    const game = await Game.create({ status: 'waiting', turn: userId })
    return response.status(201).json({ message: 'Game created', game })
  }

  public async joinGame({ params, response, auth }: HttpContext) {
    const { id } = params
    const user = await auth.authenticate()
    const userId = user.id

    // Buscar el juego por ID
    const game = await Game.findOrFail(id)

    // Verificar si el juego ya está lleno
    if (game.status === 'full') {
      return response.status(400).json({ message: 'Game is full' })
    }

    // Buscar el registro del juego en la tabla `game_log`
    let gameLog = await GameLog.query().where('gameId', game.id).first()
    //vereficamos si el jugador ya se unio al juego
    if (gameLog?.jugador1 == userId || gameLog?.jugador2 == userId) {
      return response.status(400).json({ message: 'Ya se unio' })
    }
    // Si no existe un registro en `game_log` para este juego, crear uno y asignar al jugador1
    if (!gameLog) {
      gameLog = await GameLog.create({
        gameId: game.id,
        jugador1: userId,
      })
      game.status = 'waiting'
      await game.save()
      /* const mensaje = 'Se ha unido el jugador 1 (' + user.fullName + ') al juego: ' + game.id
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: '#laravel-adonis', // Canal fijo
          text: mensaje, // Mensaje fijo
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SLACK_TOKE}`,
            'Content-Type': 'application/json',
          },
        }
      )*/
      return response.status(200).json({ message: 'Joined as player 1', game, gameLog })
    }

    // Si existe un registro, verificar si `jugador2` está vacío y asignar al usuario
    if (!gameLog.jugador2) {
      gameLog.jugador2 = userId
      await gameLog.save()

      // Cambiar el estado del juego a `full` ya que ambos jugadores se han unido
      game.status = 'full'
      await game.save()
      /*const mensaje = 'Se ha unido el jugador 2 (' + user.fullName + ') al juego: ' + game.id
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: '#laravel-adonis', // Canal fijo
          text: mensaje, // Mensaje fijo
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SLACK_TOKE}`,
            'Content-Type': 'application/json',
          },
        }
      )*/
      return response.status(200).json({ message: 'Joined as player 2', game, gameLog })
    }

    // Si ambos jugadores ya están presentes, retornar un mensaje de error
    return response.status(400).json({ message: 'Game already has two players' })
  }
  /**
   * Función para elegir posiciones aleatorias para los barcos
   */
  public async placeShips({ params, request, response, auth }: HttpContext) {
    const { id } = params // ID del juego
    const user = await auth.authenticate()
    const userId = user.id
    // revisamos si el usuaro ya se unio al juego
    /* const game = await GameLog.findOrFail(id)
        // Verificar si ambos jugadores se han unido al juego
        if (!game.jugador1 || !game.jugador2) {
          return response.status(400).json({ message: 'Falta un jugador' })
        }
    
        // Verificar si el usuario actual es uno de los jugadores
        if (game.jugador1 !== userId && game.jugador2 !== userId) {
          return response.status(400).json({ message: 'Tu no estás en el juego' })
        }*/

    // Recibir las posiciones de los barcos desde el cuerpo de la solicitud
    const { ships } = request.only(['ships'])

    // Validar que el usuario haya enviado exactamente 5 posiciones
    if (!ships || ships.length !== 5) {
      return response.status(400).json({ message: 'Tu debes enviar 5 posiciones.' })
    }

    const shipPositions = []

    // Validar y crear cada barco en la posición especificada
    for (const { x, y } of ships) {
      // Validar que las posiciones estén dentro del rango 0-5
      if (x < 0 || x >= 6 || y < 0 || y >= 6) {
        return response.status(400).json({
          message: `Invalido pocicion (${x}, ${y}). Las posiciones deben estar entre 0 y 5.`,
        })
      }

      // Verificar que no haya otro barco en la misma posición
      const existingShip = await Ship.query()
        .where('game_id', id)
        .where('position_x', x)
        .where('position_y', y)
        .where('user_id', userId)
        .first()

      if (existingShip) {
        return response.status(400).json({
          message: `A ship is already placed at (${x}, ${y}). Choose a different position.`,
        })
      }

      // Crear el barco en la posición indicada
      await Ship.create({
        game_id: id,
        user_id: userId,
        position_x: x,
        position_y: y,
      })

      shipPositions.push({ x, y })
    }

    return response.status(201).json({ message: 'Ships placed successfully', shipPositions })
  }
  public async attack({ auth, request, response, params }: HttpContext) {
    const { id } = params
    const user = await auth.authenticate()
    const { x, y } = request.only(['x', 'y'])

    // Buscar el Game y GameLog por ID
    const game = await Game.findOrFail(id)
    const gameLog = await GameLog.query().where('gameId', id).first()

    // Verificar si el usuario es uno de los jugadores
    if (!gameLog || (gameLog.jugador1 !== user.id && gameLog.jugador2 !== user.id)) {
      return response.status(400).json({ message: 'Tú no estás en el juego' })
    }

    // Verificar si ambos jugadores están en el juego
    if (!gameLog.jugador1 || !gameLog.jugador2) {
      return response.status(400).json({ message: 'Falta un jugador' })
    }

    // Verificar si ambos jugadores tienen suficientes barcos
    const [player1ShipsCount, player2ShipsCount] = await Promise.all([
      Ship.query().where('game_id', id).where('user_id', gameLog.jugador1).count('* as total'),
      Ship.query().where('game_id', id).where('user_id', gameLog.jugador2).count('* as total'),
    ])

    if (player1ShipsCount[0].$extras.total < 5 || player2ShipsCount[0].$extras.total < 5) {
      return response
        .status(400)
        .json({ message: 'Ambos jugadores deben colocar sus barcos antes de iniciar el ataque' })
    }

    // cereficamos si el game fea abandonado
    if (game.status === 'abandoned') {
      return response.status(400).json({ message: 'El juego ha sido abandonado' })
    }

    // Verificar si es el turno del usuario actual
    if (game.turn !== user.id) {
      return response.status(400).json({ message: 'No es tu turno' })
    }

    // Verificar si la posición ya ha sido atacada
    const previousAttack = await Attack.query()
      .where('game_id', id)
      .where('position_x', x)
      .where('position_y', y)
      .first()

    if (previousAttack) {
      return response.status(400).json({ message: 'Esta posición ya ha sido atacada' })
    }

    // Registrar el ataque
    const attack = await Attack.create({
      game_id: game.id,
      attacker_id: user.id,
      position_x: x,
      position_y: y,
    })

    await GameLog.create({
      gameId: game.id,
      action: `Ataque en (${x}, ${y}) por el usuario ${user.id}`,
    })

    // Verificar si el ataque impactó un barco
    const isHit = await this.checkHit(game.id, x, y, user.id)
    if (isHit) {
      await GameLog.create({
        gameId: game.id,
        action: `Barco impactado en (${x}, ${y}) por el usuario ${user.id}`,
      })
    }

    // Verificar si el juego ha terminado
    const isGameOver = await this.checkGameOver(game.id, gameLog.jugador1, gameLog.jugador2)
    if (isGameOver) {
      game.status = 'finished'
      game.winner = user.id
      await game.save()

      return response.json({ message: 'El juego ha terminado', winner: user.id })
    }

    // Cambiar el turno al otro jugador
    game.turn = game.turn === gameLog.jugador1 ? gameLog.jugador2 : gameLog.jugador1
    await game.save()

    return response.json({ message: 'Ataque registrado', attack, isHit })
  }

  /**
   * Función para verificar si un ataque ha acertado un barco
   */
  private async checkHit(gameId: number, x: number, y: number, user: number): Promise<boolean> {
    const ship = await Ship.query()
      .where('game_id', gameId)
      .where('position_x', x)
      .where('position_y', y)
      .first()

    if (ship) {
      const mensaje = `Ataque en (${x}, ${y}) por el usuario ${user} ha acertado un barco`
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: '#laravel-adonis', // Canal fijo
          text: mensaje, // Mensaje fijo
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SLACK_TOKE}`,
            'Content-Type': 'application/json',
          },
        }
      )
      ship.is_sunk = true
      await ship.save()

      return true
    }
    const mensaje = `Ataque en (${x}, ${y}) por el usuario ${user} no ha acertado un barco`
    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: '#laravel-adonis', // Canal fijo
        text: mensaje, // Mensaje fijo
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_TOKE}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return false
  }

  /**
   * Función para verificar si el juego ha terminado
   */
  private async checkGameOver(gameId: number, player1: number, player2: number): Promise<boolean> {
    const remainingShips = await Ship.query()
      .where('game_id', gameId)
      .whereIn('user_id', [player1, player2])
      .where('is_sunk', false)
      .count('* as total')
    const mensaje = `Juego terminado, jugador ${player1} ha ganado`
    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: '#laravel-adonis', // Canal fijo
        text: mensaje, // Mensaje fijo
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_TOKE}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return remainingShips[0].$extras.total === 0
  }
  public async listGames({ response }: HttpContext) {
    try {
      const games = await GameLog.all()
      return response.json({ message: 'Lista de juegos', games })
    } catch (error) {
      return response.status(500).json({ message: 'Error al obtener los juegos', error })
    }
  }

  // Función para mostrar los detalles de un juego específico (solo para usuarios autenticados)
  public async showGame({ params, response }: HttpContext) {
    const { id } = params
    try {
      const game = await GameLog.query().where('id', id).first()

      if (!game) {
        return response.status(404).json({ message: 'Juego no encontrado' })
      }

      return response.json({ message: 'Detalles del juego', game })
    } catch (error) {
      return response.status(500).json({ message: 'Error al obtener el juego', error })
    }
  }
  public async Consultar({ response }: HttpContext) {
    try {
      // Consultamos todos los juegos con estatus 'waiting'
      const games = await Game.query().where('status', 'waiting')
      // verificamos si hay juegos disponibles
      if (games.length === 0) {
        return response.json({ message: 'No hay juegos disponibles' })
      }
      return response.json({ message: 'Juegos disponibles:', games })
    } catch (error) {
      return response.status(500).json({ message: 'Error al obtener los juegos', error })
    }
  }
  public async abandonar({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const userId = user.id
    const { id } = params
    try {
      const game = await Game.query().where('id', id).first()
      if (!game) {
        return response.status(404).json({ message: 'Juego no encontrado' })
      }
      const gameLog = await GameLog.query().where('gameId', id).first()
      let userIdwinner: number= 0; // Declare userId
      if (gameLog) {
        if (gameLog.jugador1 === userId) {
          userIdwinner = gameLog.jugador2
        } else if (gameLog.jugador2 === userId) {
          userIdwinner = gameLog.jugador1
        }
      } else {
        // Handle the case where gameLog is null
        return response.status(404).json({ message: 'Game log not found' })
      }
      game.winner = userIdwinner
      game.status = 'abandoned'
      await game.save()

      return response.json({ message: 'Juego abandonado', game })
    } catch (error) {
      return response.status(500).json({ message: 'Error al abandonar el juego', error })
    }
  }
}
