import { Server } from 'socket.io'

export function setupSocketHandler(io: Server) {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id)
  })
}
