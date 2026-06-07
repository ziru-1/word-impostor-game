import { describe, expect, it, beforeEach } from 'vitest'
import { getRoom, rooms } from '../roomManager'
import { createMockRoom } from '../../__tests__/testHelper'

describe('getRoom', () => {
  beforeEach(() => {
    rooms.clear()
  })

  it('returns the room when it exists', () => {
    const room = createMockRoom({ id: 'ROOM1' })
    rooms.set('ROOM1', room)

    const result = getRoom('ROOM1')
    expect(result).toEqual(room)
  })

  it('throws an error when the room does not exist', () => {
    expect(() => getRoom('INVALID')).toThrow('Room not found')
  })
})
