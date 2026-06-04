import {
  CastVotePayload,
  CreateRoomPayload,
  GameReveal,
  JoinRoomPayload,
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
  removePlayerFromRoom,
  resetRoomToLobby,
  toggleImpostorHint,
  toPublicGameRoom,
  updateRoom,
} from '../game/roomManager'

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
      if (
        updatedRoom.descriptions.length >= updatedRoom.descriptionOrder.length
      ) {
        updatedRoom = updateRoom(checkDescriptionPhaseEnd(updatedRoom))
      }
    }

    io.to(roomId).emit('roomUpdated', toPublicGameRoom(updatedRoom))

    if (updatedRoom.stage === 'results') {
      const remainingImpostor = updatedRoom.players.find((p) => p.isImpostor)

      const impostorId = remainingImpostor
        ? remainingImpostor.id
        : leavingPlayer.id
      const impostorName = remainingImpostor
        ? remainingImpostor.name
        : leavingPlayer.name

      const revealData: GameReveal = {
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

    socket.on('createRoom', (data: CreateRoomPayload) => {
      try {
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
