import { Player, GameRoom, PublicGameRoom } from '@impostor/types'

export const rooms = new Map<string, GameRoom>()

export function toPublicGameRoom(room: GameRoom): PublicGameRoom {
  const { sharedWord, fakeWord, ...rest } = room
  return {
    ...rest,
    allPlayerNames: room.allPlayerNames,
    players: room.players.map(({ id, name }) => ({
      id,
      name,
    })),
  }
}

export function getRoom(roomId: string): GameRoom {
  const room = rooms.get(roomId)
  if (!room) throw new Error('Room not found')
  return room
}

export function updateRoom(room: GameRoom): GameRoom {
  rooms.set(room.id, room)
  return room
}

export function createRoom(hostPlayer: Player): GameRoom {
  const room: GameRoom = {
    id: Math.random().toString(36).slice(2, 7).toUpperCase(),
    hostId: hostPlayer.id,
    players: [hostPlayer],
    allPlayerNames: { [hostPlayer.id]: hostPlayer.name },
    chatMessages: [],
    impostorHasHint: true,
    stage: 'lobby',
    roundNumber: 1,
    descriptionOrder: [],
    descriptions: [],
    allDescriptions: [],
    roundDecisions: [],
    votes: [],
    sharedWord: '',
    fakeWord: '',
    votedOutPlayerId: null,
    playAgainPlayerIds: [],
  }

  rooms.set(room.id, room)
  return room
}

export function joinRoom(roomId: string, player: Player): GameRoom {
  const room = getRoom(roomId)

  if (room.players.length >= 8) {
    throw new Error('Room is full')
  }

  if (room.stage != 'lobby') {
    throw new Error('Game has already started')
  }

  const updatedRoom: GameRoom = {
    ...room,
    players: [...room.players, player],
    allPlayerNames: {
      ...room.allPlayerNames,
      [player.id]: player.name,
    },
    chatMessages: [
      ...room.chatMessages,
      {
        text: `${player.name} joined the room.`,
        isSystem: true,
        playerId: '',
        playerName: 'System',
      },
    ],
  }
  rooms.set(roomId, updatedRoom)
  return updatedRoom
}

export function kickPlayerFromRoom(
  roomId: string,
  hostId: string,
  targetId: string,
): GameRoom {
  const room = getRoom(roomId)

  if (hostId !== room.hostId) {
    throw new Error('Only the host can kick players')
  }

  if (room.stage !== 'lobby') {
    throw new Error('Players can only be kicked while in the lobby')
  }

  if (targetId === room.hostId) {
    throw new Error('You cannot kick yourself')
  }

  const targetPlayer = room.players.find((p) => p.id === targetId)
  if (!targetPlayer) {
    throw new Error('Player not found in room')
  }

  const remainingPlayers = room.players.filter((p) => p.id !== targetId)

  const updatedRoom: GameRoom = {
    ...room,
    players: remainingPlayers,
    chatMessages: [
      ...room.chatMessages,
      {
        text: `${targetPlayer.name} was kicked from the room by the host.`,
        isSystem: true,
        playerId: '',
        playerName: 'System',
      },
    ],
  }

  rooms.set(roomId, updatedRoom)
  return updatedRoom
}

export function toggleImpostorHint(
  room: GameRoom,
  requesterId: string,
): GameRoom {
  if (requesterId !== room.hostId) {
    throw new Error('Only the host can change game settings')
  }

  if (room.stage !== 'lobby') {
    throw new Error('Cannot change settings after the game has started')
  }

  const updatedRoom: GameRoom = {
    ...room,
    impostorHasHint: !room.impostorHasHint,
  }

  rooms.set(room.id, updatedRoom)
  return updatedRoom
}

export function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): GameRoom | null {
  const room = getRoom(roomId)
  const remainingPlayers = room.players.filter((p) => p.id !== playerId)

  if (remainingPlayers.length === 0) {
    rooms.delete(roomId)
    return null
  }

  let newHostId = room.hostId
  let hostChangedNotice = ''

  if (room.hostId === playerId) {
    newHostId = remainingPlayers[0].id
    hostChangedNotice = ` ${remainingPlayers[0].name} is the new host.`
  }

  const leavingPlayer = room.players.find((p) => p.id === playerId)
  const leavingPlayerName = leavingPlayer ? leavingPlayer.name : 'A player'

  let updatedRoom: GameRoom = {
    ...room,
    players: remainingPlayers,
    hostId: newHostId,
    chatMessages: [
      ...room.chatMessages,
      {
        text: `${leavingPlayerName} left the room.${hostChangedNotice}`,
        isSystem: true,
        playerId: '',
        playerName: 'System',
      },
    ],
  }

  if (room.stage !== 'lobby' && room.stage !== 'results') {
    if (remainingPlayers.length < 3) {
      updatedRoom.stage = 'results'
      updatedRoom.chatMessages.push({
        text: 'Game ended prematurely: Not enough players left to continue playing.',
        isSystem: true,
        playerId: '',
        playerName: 'System',
      })

      rooms.set(roomId, updatedRoom)
      return updatedRoom
    }

    const leftPlayerWasImpostor = leavingPlayer?.isImpostor
    if (leftPlayerWasImpostor) {
      updatedRoom.stage = 'results'
      updatedRoom.chatMessages.push({
        text: `The Impostor left the match! Innocents win by default.`,
        isSystem: true,
        playerId: '',
        playerName: 'System',
      })

      rooms.set(roomId, updatedRoom)
      return updatedRoom
    }

    updatedRoom.descriptionOrder = room.descriptionOrder.filter(
      (id) => id !== playerId,
    )

    updatedRoom.votes = room.votes.filter((v) => v.voterId !== playerId)
  }

  rooms.set(roomId, updatedRoom)
  return updatedRoom
}

export function resetRoomToLobby(room: GameRoom): GameRoom {
  const updatedRoom: GameRoom = {
    ...room,
    stage: 'lobby',
    roundNumber: 1,
    descriptionOrder: [],
    descriptions: [],
    allDescriptions: [],
    roundDecisions: [],
    votes: [],
    sharedWord: '',
    fakeWord: '',
    votedOutPlayerId: null,
    playAgainPlayerIds: [],
    players: room.players.map((player) => ({
      ...player,
      word: '',
      isImpostor: false,
    })),
  }
  rooms.set(room.id, updatedRoom)
  return updatedRoom
}
