import { CreateRoomPayload, JoinRoomPayload, Player } from '@impostor/types'
import { Server, Socket } from 'socket.io'
import { createRoom, joinRoom, toPublicGameRoom } from '../game/roomManager'

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
  })
}
