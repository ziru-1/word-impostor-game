import {
  CreateRoomPayload,
  JoinRoomPayload,
  Player,
  StartGamePayload,
} from '@impostor/types'
import { Server, Socket } from 'socket.io'
import { startGame } from '../game/gameLogic'
import {
  createRoom,
  getRoom,
  joinRoom,
  rooms,
  toPublicGameRoom,
} from '../game/roomManager'

function isInvalidName(name: string): boolean {
  return !name || name.trim() === ''
}

function handleError(socket: Socket, error: unknown) {
  socket.emit('error', error instanceof Error ? error.message : 'Unknown error')
}

function createPlayerFromSocket(socketId: string, name: string): Player {
  return { id: socketId, name, word: '', isImpostor: false }
}

export function setupSocketHandler(io: Server) {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id)

    socket.on('createRoom', (data: CreateRoomPayload) => {
      try {
        if (isInvalidName(data.name))
          return socket.emit('error', 'Name is required')

        const player: Player = createPlayerFromSocket(socket.id, data.name)

        const room = createRoom(player)
        socket.join(room.id)
        socket.emit('roomCreated', toPublicGameRoom(room))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('joinRoom', (data: JoinRoomPayload) => {
      try {
        if (isInvalidName(data.name))
          return socket.emit('error', 'Name is required')

        const player: Player = createPlayerFromSocket(socket.id, data.name)

        const room = joinRoom(data.roomId, player)

        socket.join(room.id)
        io.to(room.id).emit('roomUpdated', toPublicGameRoom(room))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('startGame', (data: StartGamePayload) => {
      try {
        const room = getRoom(data.roomId)

        if (room.players.length < 3) {
          return socket.emit(
            'error',
            'Game must have three or more players to start',
          )
        }

        if (socket.id !== room.hostId) {
          return socket.emit(
            'error',
            'Game can only be started by the host player',
          )
        }

        const updatedGameRoom = startGame(room)

        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('leaveRoom', () => {
      const roomId = socketRoomMap.get(socket.id)
      if (!roomId) return
      handlePlayerLeave(socket, roomId)
    })

    socket.on('disconnect', () => {
      const roomId = socketRoomMap.get(socket.id)
      if (!roomId) return
      handlePlayerLeave(socket, roomId)
    })
  })
}
