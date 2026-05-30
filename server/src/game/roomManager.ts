import { Player, GameRoom, PublicGameRoom } from '@impostor/types'

export const rooms = new Map<string, GameRoom>()

export function toPublicGameRoom(room: GameRoom): PublicGameRoom {
  const { sharedWord, fakeWord, ...rest } = room
  return {
    ...rest,
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

  const leavingPlayer = room.players.find((p) => p.id === playerId)
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

  const leavingPlayerName = leavingPlayer ? leavingPlayer.name : 'A player'

  const updatedRoom: GameRoom = {
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

  rooms.set(roomId, updatedRoom)
  return updatedRoom
}
