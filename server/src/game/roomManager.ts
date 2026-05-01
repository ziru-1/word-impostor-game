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

export function createRoom(hostPlayer: Player): GameRoom {
  const room: GameRoom = {
    id: Math.random().toString(36).slice(2, 7).toUpperCase(),
    hostId: hostPlayer.id,
    players: [hostPlayer],
    roundNumber: 1,
    votes: [],
    roundDecisions: [],
    sharedWord: '',
    fakeWord: '',
    stage: 'lobby',
    votedOutPlayerId: null,
  }

  rooms.set(room.id, room)
  return room
}

export function joinRoom(roomId: string, player: Player): GameRoom {
  const room = rooms.get(roomId)

  if (!room) {
    throw new Error('Room not found')
  }

  room.players.push(player)

  return room
}

export function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): GameRoom | null {
  const room = rooms.get(roomId)

  if (!room) {
    throw new Error('Room not found')
  }

  const remainingPlayers = room.players.filter((p) => p.id !== playerId)

  if (remainingPlayers.length === 0) {
    rooms.delete(roomId)
    return null
  }

  let newHostId = room.hostId

  if (room.hostId === playerId) {
    const randomIndex = Math.floor(Math.random() * remainingPlayers.length)
    newHostId = remainingPlayers[randomIndex].id
  }

  const updatedRoom: GameRoom = {
    ...room,
    players: remainingPlayers,
    hostId: newHostId,
  }

  rooms.set(roomId, updatedRoom)

  return updatedRoom
}
