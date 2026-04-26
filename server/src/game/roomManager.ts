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
