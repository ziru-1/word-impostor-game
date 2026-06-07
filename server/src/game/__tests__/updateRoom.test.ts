import { describe, expect, it, beforeEach } from 'vitest'
import { updateRoom, rooms } from '../roomManager'
import { createMockRoom } from '../../__tests__/testHelper'

describe('updateRoom', () => {
  beforeEach(() => {
    rooms.clear()
  })

  it('saves the updated room state to the rooms map', () => {
    const room = createMockRoom({ id: 'ROOM1', stage: 'lobby' })
    rooms.set('ROOM1', room)

    const updatedRoom = { ...room, stage: 'playing' as const }
    const result = updateRoom(updatedRoom)

    expect(result).toEqual(updatedRoom)
    expect(rooms.get('ROOM1')).toEqual(updatedRoom)
  })
})
