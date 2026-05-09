import { useState, useEffect } from 'react'
import { socket } from './socket/socket'
import type { PublicGameRoom } from '@impostor/types'
import LandingPage from './components/LandingPage'

export default function App() {
  const [room, setRoom] = useState<PublicGameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  console.log(room)

  useEffect(() => {
    socket.on('connect', () => setPlayerId(socket.id ?? null))
    socket.on('roomCreated', (room: PublicGameRoom) => setRoom(room))
    socket.on('roomUpdated', (room: PublicGameRoom) => setRoom(room))

    return () => {
      socket.off('connect')
      socket.off('roomCreated')
      socket.off('roomUpdated')
      socket.disconnect()
    }
  }, [])

  function onCreateRoom(name: string) {
    socket.connect()
    socket.emit('createRoom', { name })
  }

  function onJoinRoom(name: string, roomId: string) {
    socket.connect()
    socket.emit('joinRoom', { name, roomId })
  }

  switch (room?.stage ?? 'landing') {
    case 'landing':
      return <LandingPage onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
    case 'lobby':
      return <div>Lobby</div>
    case 'playing':
      return <div>GameScreen</div>
    case 'voting':
      return <div>VotingScreen</div>
    case 'results':
      return <div>ResultsScreen</div>
  }
}
