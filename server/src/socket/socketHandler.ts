import {
  CastVotePayload,
  CreateRoomPayload,
  JoinRoomPayload,
  KickPlayerPayload,
  PlayAgainPayload,
  Player,
  PlayerDescriptionPayload,
  SendMessagePayload,
  StartGamePayload,
  SubmitDecisionPayload,
  ToggleImpostorHintPayload,
} from '@impostor/types'
import { Server, Socket } from 'socket.io'
import {
  castVote,
  checkDescriptionPhaseEnd,
  sendMessage,
  startGame,
  submitDescription,
  submitPlayAgain,
  submitRoundDecision,
} from '../game/gameLogic'
import {
  createRoom,
  getRoom,
  joinRoom,
  kickPlayerFromRoom,
  removePlayerFromRoom,
  resetRoomToLobby,
  toggleImpostorHint,
  toPublicGameRoom,
  updateRoom,
} from '../game/roomManager'
import { checkRateLimit, clearRateLimitTracker } from '../utils/rateLimiter'

const socketRoomMap = new Map<string, string>()

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
  function handlePlayerLeave(socket: Socket, roomId: string) {
    socketRoomMap.delete(socket.id)
    clearRateLimitTracker(socket.id)
    socket.leave(roomId)

    const roomBeforeLeave = getRoom(roomId)
    const leavingPlayer = roomBeforeLeave?.players.find(
      (p) => p.id === socket.id,
    )

    if (!leavingPlayer) return

    let updatedRoom = removePlayerFromRoom(roomId, socket.id)
    if (!updatedRoom) return

    if (updatedRoom.stage === 'results') {
      updatedRoom.playAgainPlayerIds = updatedRoom.playAgainPlayerIds.filter(
        (id) => id !== socket.id,
      )

      const currentPlayAgainIds = updatedRoom.playAgainPlayerIds
      const allRemainingAreReady =
        updatedRoom.players.length > 0 &&
        updatedRoom.players.every((player) =>
          currentPlayAgainIds.includes(player.id),
        )

      if (allRemainingAreReady) {
        updatedRoom = resetRoomToLobby(updatedRoom)
      } else {
        updateRoom(updatedRoom)
      }
    }

    if (updatedRoom.stage === 'playing') {
      const submittedPlayerIds = new Set(
        updatedRoom.descriptions.map((d) => d.playerId),
      )

      const allRemainingHaveSubmitted = updatedRoom.descriptionOrder.every(
        (id) => submittedPlayerIds.has(id),
      )

      if (allRemainingHaveSubmitted) {
        updatedRoom.allDescriptions = updatedRoom.allDescriptions.concat([
          updatedRoom.descriptions,
        ])
        updatedRoom.descriptions = []

        updateRoom(updatedRoom)
      }
    }

    if (
      updatedRoom.roundDecisions.length > 0 &&
      updatedRoom.stage === 'playing'
    ) {
      updatedRoom.roundDecisions = updatedRoom.roundDecisions.filter(
        (d) => d.playerId !== socket.id,
      )

      const decisionPlayerIds = new Set(
        updatedRoom.roundDecisions.map((d) => d.playerId),
      )
      const allPlayersDecided = updatedRoom.players.every((player) =>
        decisionPlayerIds.has(player.id),
      )

      if (allPlayersDecided) {
        let voteCount = 0
        let skipCount = 0

        for (const d of updatedRoom.roundDecisions) {
          if (d.choice === 'vote') voteCount++
          else if (d.choice === 'skip') skipCount++
        }

        if (voteCount > skipCount || updatedRoom.roundNumber >= 3) {
          updatedRoom.stage = 'voting'
        } else {
          updatedRoom.roundNumber = updatedRoom.roundNumber + 1
          updatedRoom.descriptions = []
          updatedRoom.roundDecisions = []
        }
        updateRoom(updatedRoom)
      }
    }

    if (updatedRoom.stage === 'voting') {
      const votesVoterIds = new Set(updatedRoom.votes.map((d) => d.voterId))
      const allPlayersVoted = updatedRoom.players.every((player) =>
        votesVoterIds.has(player.id),
      )

      if (allPlayersVoted) {
        let maxVotes = 0
        let leaders: string[] = []
        const voteCounts: Record<string, number> = {}

        for (const vote of updatedRoom.votes) {
          const count = (voteCounts[vote.targetId] || 0) + 1
          voteCounts[vote.targetId] = count

          if (count > maxVotes) {
            maxVotes = count
            leaders = [vote.targetId]
          } else if (count === maxVotes) {
            leaders.push(vote.targetId)
          }
        }

        const votedOutPlayerId =
          leaders.length === 1
            ? leaders[0]
            : leaders[Math.floor(Math.random() * leaders.length)]

        updatedRoom.votedOutPlayerId = votedOutPlayerId
        updatedRoom.stage = 'results'
        updateRoom(updatedRoom)
      }
    }

    io.to(roomId).emit('roomUpdated', toPublicGameRoom(updatedRoom))

    if (updatedRoom.stage === 'results') {
      const remainingImpostor = updatedRoom.players.find((p) => p.isImpostor)
      const impostorId = remainingImpostor
        ? remainingImpostor.id
        : leavingPlayer.id

      const impostorName =
        updatedRoom.allPlayerNames[impostorId] || leavingPlayer.name

      const revealData = {
        impostorId,
        impostorName,
        impostorHasHint: updatedRoom.impostorHasHint,
        sharedWord: updatedRoom.sharedWord,
        fakeWord: updatedRoom.fakeWord,
      }

      io.to(roomId).emit('gameReveal', revealData)
    }
  }

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id)

    socket.use(([event, ...args], next) => {
      if (!checkRateLimit(socket.id, 8, 3000)) {
        return next(
          new Error('You are performing actions too fast. Please slow down.'),
        )
      }
      next()
    })

    socket.on('error', (err) => {
      socket.emit('error', err.message || 'Rate limit exceeded')
    })

    socket.on('createRoom', (data: CreateRoomPayload) => {
      try {
        if (!checkRateLimit(`create-${socket.id}`, 2, 10000)) {
          return socket.emit(
            'error',
            'Too many room requests. Please wait before creating a new room.',
          )
        }

        if (isInvalidName(data.name))
          return socket.emit('error', 'Name is required')

        const player: Player = createPlayerFromSocket(socket.id, data.name)

        const room = createRoom(player)
        socket.join(room.id)
        socketRoomMap.set(socket.id, room.id)
        socket.emit('roomCreated', toPublicGameRoom(room))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('joinRoom', (data: JoinRoomPayload) => {
      try {
        if (!checkRateLimit(`join-${socket.id}`, 4, 10000)) {
          return socket.emit(
            'error',
            'Too many join requests. Please wait a moment.',
          )
        }

        if (isInvalidName(data.name))
          return socket.emit('error', 'Name is required')

        const player: Player = createPlayerFromSocket(socket.id, data.name)

        const room = joinRoom(data.roomId, player)

        socket.join(room.id)
        socketRoomMap.set(socket.id, room.id)
        io.to(room.id).emit('roomUpdated', toPublicGameRoom(room))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('kickPlayer', (data: KickPlayerPayload) => {
      try {
        const updatedRoom = kickPlayerFromRoom(
          data.roomId,
          socket.id,
          data.targetId,
        )

        const targetSocket = io.sockets.sockets.get(data.targetId)
        if (targetSocket) {
          socketRoomMap.delete(data.targetId)
          clearRateLimitTracker(data.targetId)
          targetSocket.leave(data.roomId)
          targetSocket.emit('kicked')
        }

        io.to(data.roomId).emit('roomUpdated', toPublicGameRoom(updatedRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('toggleImpostorHint', (data: ToggleImpostorHintPayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = toggleImpostorHint(room, socket.id)

        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('startGame', (data: StartGamePayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = updateRoom(startGame(room, socket.id))
        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))

        updatedGameRoom.players.forEach((player) => {
          io.to(player.id).emit('playerGameData', {
            isImpostor: player.isImpostor,
            word: player.word,
          })
        })
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('submitDescription', (data: PlayerDescriptionPayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedRoom = updateRoom(
          checkDescriptionPhaseEnd(
            submitDescription(room, socket.id, data.text),
          ),
        )

        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('submitDecision', (data: SubmitDecisionPayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = updateRoom(
          submitRoundDecision(room, socket.id, data.choice),
        )
        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('castVote', (data: CastVotePayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = updateRoom(
          castVote(room, socket.id, data.targetId),
        )

        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))

        if (updatedGameRoom.stage === 'results') {
          const impostor = updatedGameRoom.players.find((p) => p.isImpostor)
          if (!impostor) throw new Error('No impostor found')

          io.to(room.id).emit('gameReveal', {
            impostorId: impostor.id,
            impostorName: impostor.name,
            impostorHasHint: updatedGameRoom.impostorHasHint,
            sharedWord: updatedGameRoom.sharedWord,
            fakeWord: updatedGameRoom.fakeWord,
          })
        }
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('playAgain', (data: PlayAgainPayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = updateRoom(submitPlayAgain(room, socket.id))

        io.to(room.id).emit('roomUpdated', toPublicGameRoom(updatedGameRoom))
      } catch (error) {
        handleError(socket, error)
      }
    })

    socket.on('sendMessage', (data: SendMessagePayload) => {
      try {
        const room = getRoom(data.roomId)

        const updatedGameRoom = updateRoom(
          sendMessage(room, socket.id, data.message),
        )

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
