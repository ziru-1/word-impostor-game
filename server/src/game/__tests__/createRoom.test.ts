import { GameRoom } from '@impostor/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMockPlayer } from '../../__tests__/testHelper'
import { createRoom, rooms } from '../roomManager'

const hostPlayer = createMockPlayer({ id: 'HOST1', name: 'Host Player' })

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
