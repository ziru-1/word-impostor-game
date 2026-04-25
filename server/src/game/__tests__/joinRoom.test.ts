import { GameRoom } from '@impostor/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMockPlayer } from '../../__tests__/testHelper'
import { createRoom, joinRoom, rooms } from '../roomManager'

const hostPlayer = createMockPlayer({ id: 'HOST1', name: 'Host Player' })
const testPlayer = createMockPlayer({ id: 'P2', isImpostor: true, word: 'cat' })

beforeEach(() => {
  rooms.clear()
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
