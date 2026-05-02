import { beforeEach, describe, expect, it } from 'vitest'
import { createMockPlayer } from '../../__tests__/testHelper'
import { createRoom, removePlayerFromRoom, rooms } from '../roomManager'

beforeEach(() => {
  rooms.clear()
})

describe('removePlayerFromRoom', () => {
  it('throws if room does not exist', () => {
    expect(() => removePlayerFromRoom('INVALID', 'P1')).toThrow(
      'Room not found',
    )
  })

  it('returns null and deletes room when last player leaves', () => {
    const host = createMockPlayer({ id: 'HOST1' })
    const room = createRoom(host)

    const result = removePlayerFromRoom(room.id, 'HOST1')

    expect(result).toBeNull()
    expect(rooms.has(room.id)).toBe(false)
  })

  it('removes the correct player from the room', () => {
    const host = createMockPlayer({ id: 'HOST1' })
    const guest = createMockPlayer({ id: 'GUEST1' })
    const room = createRoom(host)
    rooms.get(room.id)!.players.push(guest)

    const result = removePlayerFromRoom(room.id, 'GUEST1')

    expect(result!.players.some((p) => p.id === 'GUEST1')).toBe(false)
    expect(result!.players).toHaveLength(1)
  })

  it('assigns a new host when host leaves', () => {
    const host = createMockPlayer({ id: 'HOST1' })
    const guest = createMockPlayer({ id: 'GUEST1' })
    const room = createRoom(host)
    rooms.get(room.id)!.players.push(guest)

    const result = removePlayerFromRoom(room.id, 'HOST1')

    expect(result!.hostId).not.toBe('HOST1')
    expect(result!.hostId).toBe('GUEST1')
  })

  it('does not change host when non-host leaves', () => {
    const host = createMockPlayer({ id: 'HOST1' })
    const guest = createMockPlayer({ id: 'GUEST1' })
    const room = createRoom(host)
    rooms.get(room.id)!.players.push(guest)

    const result = removePlayerFromRoom(room.id, 'GUEST1')

    expect(result!.hostId).toBe('HOST1')
  })

  it('updates the room in the rooms Map', () => {
    const host = createMockPlayer({ id: 'HOST1' })
    const guest = createMockPlayer({ id: 'GUEST1' })
    const room = createRoom(host)
    rooms.get(room.id)!.players.push(guest)

    removePlayerFromRoom(room.id, 'GUEST1')

    const updatedRoom = rooms.get(room.id)!
    expect(updatedRoom.players).toHaveLength(1)
    expect(updatedRoom.players.some((p) => p.id === 'GUEST1')).toBe(false)
  })
})
