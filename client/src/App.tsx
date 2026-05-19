import type {
  GameReveal,
  PlayerGameData,
  PublicGameRoom,
} from '@impostor/types'
import { useEffect, useState } from 'react'
import GameScreen from './components/GameScreen'
import LandingPage from './components/LandingPage'
import Lobby from './components/Lobby'
import ResultsScreen from './components/ResultsScreen'
import VotingScreen from './components/VotingScreen'
import { socket } from './socket/socket'

export default function App() {
  const [room, setRoom] = useState<PublicGameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<PlayerGameData | null>(null)
  const [reveal, setReveal] = useState<GameReveal | null>(null)

  useEffect(() => {
    socket.on('connect', () => setPlayerId(socket.id ?? null))
    socket.on('roomCreated', (room: PublicGameRoom) => setRoom(room))
    socket.on('roomUpdated', (room: PublicGameRoom) => setRoom(room))
    socket.on('playerGameData', (playerData: PlayerGameData) =>
      setPlayerData(playerData),
    )
    socket.on('gameReveal', (gameRevealData: GameReveal) =>
      setReveal(gameRevealData),
    )

    return () => {
      socket.off('connect')
      socket.off('roomCreated')
      socket.off('roomUpdated')
      socket.off('playerGameData')
      socket.off('gameReveal')
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

  function onSubmitDescription(roomId: string, text: string) {
    socket.emit('submitDescription', { roomId, text })
  }

  function onSubmitDecision(roomId: string, choice: 'skip' | 'vote') {
    socket.emit('submitDecision', { roomId, choice })
  }

  function onCastVote(roomId: string, targetId: string) {
    socket.emit('castVote', { roomId, targetId })
  }

  function onPlayAgain(roomId: string) {
    socket.emit('playAgain', { roomId })
  }

  switch (room?.stage ?? 'landing') {
    case 'landing':
      return <LandingPage onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
    case 'lobby':
      if (!room || !playerId) return null

      return <Lobby room={room} playerId={playerId} onStartGame={onStartGame} />
    case 'playing':
      if (!room || !playerId || !playerData) return null
      return (
        <GameScreen
          playerId={playerId}
          playerData={playerData}
          room={room}
          onSubmitDescription={onSubmitDescription}
          onSubmitDecision={onSubmitDecision}
        />
      )
    case 'voting':
      if (!room || !playerId) return null
      return (
        <VotingScreen playerId={playerId} room={room} onCastVote={onCastVote} />
      )
    case 'results':
      if (!room || !playerId || !reveal) return null
      return (
        <ResultsScreen
          room={room}
          playerId={playerId}
          reveal={reveal}
          onPlayAgain={onPlayAgain}
        />
      )
  }
}
