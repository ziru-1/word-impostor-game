import { describe, it, expect, beforeEach } from 'vitest'
import { createRoom, joinRoom, rooms, toPublicGameRoom } from './roomManager'
import { GameRoom, Player } from '@impostor/types'

const hostPlayer: Player = {
  id: 'HOST1',
  name: 'Host Player',
  isImpostor: false,
  word: '',
}

const testPlayer: Player = {
  id: 'GUEST1',
  name: 'Test Player',
  isImpostor: false,
  word: '',
}

const mockRoom: GameRoom = {
  id: 'ROOM1',
  hostId: 'HOST1',
  stage: 'lobby',
  sharedWord: 'secret-word',
  roundNumber: 1,
  votes: [],
  roundDecision: [],
  fakeWord: 'fake-word',
  players: [
    {
      id: 'P1',
      name: 'Alice',
      word: 'secret-word',
      isImpostor: false,
    },
    {
      id: 'P2',
      name: 'Bob',
      word: 'secret-word',
      isImpostor: true,
    },
  ],
}

beforeEach(() => {
  rooms.clear()
})

describe('createRoom', () => {
  it('should create a room with host as first player', () => {
    const room: GameRoom = createRoom(hostPlayer)
    expect(room.players).toContain(hostPlayer)
    expect(room.stage).toBe('lobby')
    expect(room.hostId).toBe(hostPlayer.id)
    expect(room.id).toHaveLength(5)
  })

  it('should store the room in the rooms Map', () => {
    const room: GameRoom = createRoom(hostPlayer)
    expect(rooms.size).toBe(1)
    expect(rooms.has(room.id)).toBe(true)
  })
})

describe('joinRoom', () => {
  it('adds a player to an existing room', () => {
    const room: GameRoom = createRoom(hostPlayer)
    const updatedRoom: GameRoom = joinRoom(room.id, testPlayer)
    expect(updatedRoom.players).toHaveLength(2)
    expect(updatedRoom.players).toContain(testPlayer)
  })

  it("throws an error when room doesn't exist", () => {
    expect(() => joinRoom('FAKEROOMID', testPlayer)).toThrow('Room not found')
  })
})

describe('toPublicGameRoom', () => {
  it('should strip word and isImpostor from players', () => {
    const publicRoom = toPublicGameRoom(mockRoom)

    for (const player of publicRoom.players) {
      expect(player).not.toHaveProperty('word')
      expect(player).not.toHaveProperty('isImpostor')
      expect(player).toHaveProperty('id')
      expect(player).toHaveProperty('name')
    }
  })

  it('should strip sharedWord and fakeWord from room', () => {
    const publicRoom = toPublicGameRoom(mockRoom)

    expect(publicRoom).not.toHaveProperty('sharedWord')
    expect(publicRoom).not.toHaveProperty('fakeWord')
    expect(publicRoom.id).toBe(mockRoom.id)
    expect(publicRoom.hostId).toBe(mockRoom.hostId)
    expect(publicRoom.stage).toBe(mockRoom.stage)
    expect(publicRoom.roundNumber).toBe(mockRoom.roundNumber)
    expect(publicRoom.votes).toEqual(mockRoom.votes)
    expect(publicRoom.roundDecision).toEqual(mockRoom.roundDecision)
  })
})
