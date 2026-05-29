import type {
  GameReveal,
  PlayerGameData,
  PublicGameRoom,
} from '@impostor/types'
import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import Chat from './components/Chat'
import GameScreen from './components/GameScreen'
import LandingPage from './components/LandingPage'
import Lobby from './components/Lobby'
import ResultsScreen from './components/ResultsScreen'
import Toast from './components/Toast'
import VotingScreen from './components/VotingScreen'
import { socket } from './socket/socket'

export default function App() {
  const [room, setRoom] = useState<PublicGameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<PlayerGameData | null>(null)
  const [reveal, setReveal] = useState<GameReveal | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    socket.on('error', (error: string) => {
      setErrorMessage(error || 'An unexpected error occurred')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setErrorMessage(null), 3000)
    })

    return () => {
      socket.off('connect')
      socket.off('roomCreated')
      socket.off('roomUpdated')
      socket.off('playerGameData')
      socket.off('gameReveal')
      socket.off('error')
      socket.disconnect()

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
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

  function onToggleImpostorHint(roomId: string) {
    socket.emit('toggleImpostorHint', { roomId })
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

  function onSendMessage(roomId: string, message: string) {
    socket.emit('sendMessage', { roomId, message })
  }

  const renderStage = () => {
    const stage = room?.stage ?? 'landing'

    switch (stage) {
      case 'landing':
        return (
          <LandingPage onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
        )
      case 'lobby':
        return room && playerId ? (
          <Lobby
            room={room}
            playerId={playerId}
            onStartGame={onStartGame}
            onToggleImpostorHint={onToggleImpostorHint}
          />
        ) : null
      case 'playing':
        return room && playerId && playerData ? (
          <GameScreen
            playerId={playerId}
            playerData={playerData}
            room={room}
            onSubmitDescription={onSubmitDescription}
            onSubmitDecision={onSubmitDecision}
          />
        ) : null
      case 'voting':
        return room && playerId ? (
          <VotingScreen
            playerId={playerId}
            room={room}
            onCastVote={onCastVote}
          />
        ) : null
      case 'results':
        return room && playerId && reveal ? (
          <ResultsScreen
            room={room}
            playerId={playerId}
            reveal={reveal}
            onPlayAgain={onPlayAgain}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className={styles.app}>
      <Toast errorMessage={errorMessage} />
      {renderStage()}
      {room !== null && playerId && (
        <Chat room={room} playerId={playerId} onSendMessage={onSendMessage} />
      )}
    </div>
  )
}
