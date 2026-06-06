import type {
  GameReveal,
  PlayerGameData,
  PublicGameRoom,
} from '@impostor/types'
import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import { chatSfx, playGameMusic, stopGameMusic } from './audioManager'
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
  const [isConnecting, setIsConnecting] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)

  const [persistedName, setPersistedName] = useState<string>(() => {
    return localStorage.getItem('impostor_player_name') || ''
  })

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevChatLengthRef = useRef<number>(0)

  useEffect(() => {
    socket.on('connect', () => setPlayerId(socket.id ?? null))

    socket.on('roomCreated', (room: PublicGameRoom) => {
      setRoom(room)
      prevChatLengthRef.current = room.chatMessages.length
      setIsConnecting(false)
    })

    socket.on('roomUpdated', (room: PublicGameRoom) => {
      if (room.chatMessages.length > prevChatLengthRef.current) {
        chatSfx.play()
      }
      prevChatLengthRef.current = room.chatMessages.length
      setRoom(room)
      setIsConnecting(false)
      setIsStartingGame(false)
    })

    socket.on('kicked', () => {
      setRoom(null)
      setPlayerData(null)
      setReveal(null)
      stopGameMusic()
      setErrorMessage('You have been kicked from the room by the host')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setErrorMessage(null), 4000)
    })

    socket.on('playerGameData', (playerData: PlayerGameData) =>
      setPlayerData(playerData),
    )

    socket.on('gameReveal', (gameRevealData: GameReveal) =>
      setReveal(gameRevealData),
    )

    socket.on('error', (error: string) => {
      setErrorMessage(error || 'An unexpected error occurred')
      setIsConnecting(false)
      setIsStartingGame(false)
      stopGameMusic()
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setErrorMessage(null), 3000)
    })

    return () => {
      socket.off('connect')
      socket.off('roomCreated')
      socket.off('roomUpdated')
      socket.off('kicked')
      socket.off('playerGameData')
      socket.off('gameReveal')
      socket.off('error')
      socket.disconnect()

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  function onCreateRoom(name: string) {
    setPersistedName(name)
    localStorage.setItem('impostor_player_name', name)
    setIsConnecting(true)

    playGameMusic()

    socket.connect()
    socket.emit('createRoom', { name })
  }

  function onJoinRoom(name: string, roomId: string) {
    setIsConnecting(true)

    playGameMusic()

    socket.connect()
    socket.emit('joinRoom', { name, roomId })
  }

  function onKickPlayer(roomId: string, targetId: string) {
    socket.emit('kickPlayer', { roomId, targetId })
  }

  function onLeaveRoom(roomId: string) {
    socket.emit('leaveRoom', { roomId })
    setRoom(null)
    setPlayerData(null)
    setReveal(null)

    stopGameMusic()
  }

  function onToggleImpostorHint(roomId: string) {
    socket.emit('toggleImpostorHint', { roomId })
  }

  function onStartGame(roomId: string) {
    setIsStartingGame(true)
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
          <LandingPage
            initialName={persistedName}
            onCreateRoom={onCreateRoom}
            onJoinRoom={onJoinRoom}
            isPending={isConnecting}
          />
        )
      case 'lobby':
        return room && playerId ? (
          <Lobby
            room={room}
            playerId={playerId}
            isStartingGame={isStartingGame}
            onStartGame={onStartGame}
            onToggleImpostorHint={onToggleImpostorHint}
            onLeaveRoom={onLeaveRoom}
            onKickPlayer={onKickPlayer}
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
      <main className={styles.mainContainer}>{renderStage()}</main>
      {room !== null && playerId && (
        <Chat room={room} playerId={playerId} onSendMessage={onSendMessage} />
      )}
    </div>
  )
}
