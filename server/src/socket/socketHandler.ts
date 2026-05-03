import { CreateRoomPayload, JoinRoomPayload, Player } from '@impostor/types'
import { Server } from 'socket.io'
import { createRoom, joinRoom, toPublicGameRoom } from '../game/roomManager'

export function setupSocketHandler(io: Server) {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id)

    socket.on('createRoom', (data: CreateRoomPayload) => {
      try {
        if (!data.name || data.name.trim() === '') {
          socket.emit('error', 'Name is required')
          return
        }

        const player: Player = {
          id: socket.id,
          name: data.name,
          word: '',
          isImpostor: false,
        }

        const room = createRoom(player)

        socket.join(room.id)
        socket.emit('roomCreated', toPublicGameRoom(room))
      } catch (error) {
        socket.emit(
          'error',
          error instanceof Error ? error.message : 'Unknown error',
        )
      }
    })

    socket.on('joinRoom', (data: JoinRoomPayload) => {
      try {
        if (!data.name || data.name.trim() === '') {
          socket.emit('error', 'Name is required')
          return
        }

        const player: Player = {
          id: socket.id,
          name: data.name,
          word: '',
          isImpostor: false,
        }

        const room = joinRoom(data.roomId, player)

        socket.join(room.id)
        io.to(room.id).emit('roomUpdated', toPublicGameRoom(room))
      } catch (error) {
        socket.emit(
          'error',
          error instanceof Error ? error.message : 'Unknown error',
        )
      }
    })
  })
}
