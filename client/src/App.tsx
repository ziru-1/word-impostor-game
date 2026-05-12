import type { PlayerGameData, PublicGameRoom } from '@impostor/types'
import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import Lobby from './components/Lobby'
import { socket } from './socket/socket'

export default function App() {
  const [room, setRoom] = useState<PublicGameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<PlayerGameData | null>(null)

  useEffect(() => {
    socket.on('connect', () => setPlayerId(socket.id ?? null))
    socket.on('roomCreated', (room: PublicGameRoom) => setRoom(room))
    socket.on('roomUpdated', (room: PublicGameRoom) => setRoom(room))
    socket.on('playerGameData', (playerData: PlayerGameData) =>
      setPlayerData(playerData),
    )

    return () => {
      socket.off('connect')
      socket.off('roomCreated')
      socket.off('roomUpdated')
      socket.off('playerGameData')
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

  function onStartGame(roomId: string) {
    socket.emit('startGame', { roomId })
  }

  switch (room?.stage ?? 'landing') {
    case 'landing':
      return <LandingPage onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
    case 'lobby':
      if (!room || !playerId) return null

      return <Lobby room={room} playerId={playerId} onStartGame={onStartGame} />
    case 'playing':
      return <div>GameScreen</div>
    case 'voting':
      return <div>VotingScreen</div>
    case 'results':
      return <div>ResultsScreen</div>
  }
}
