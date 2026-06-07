import { describe, expect, it, beforeEach } from 'vitest'
import { toggleImpostorHint, rooms } from '../roomManager'
import { createMockRoom } from '../../__tests__/testHelper'

describe('toggleImpostorHint', () => {
  beforeEach(() => {
    rooms.clear()
  })

  it('toggles the hint option when requested by the host in lobby', () => {
    const room = createMockRoom({
      id: 'ROOM1',
      hostId: 'H1',
      stage: 'lobby',
      impostorHasHint: true,
    })
    rooms.set('ROOM1', room)

    const result = toggleImpostorHint(room, 'H1')

    expect(result.impostorHasHint).toBe(false)
    expect(rooms.get('ROOM1')?.impostorHasHint).toBe(false)
  })

  it('throws an error if requested by a non-host player', () => {
    const room = createMockRoom({
      id: 'ROOM1',
      hostId: 'H1',
      stage: 'lobby',
      impostorHasHint: true,
    })

    expect(() => toggleImpostorHint(room, 'P1')).toThrow(
      'Only the host can change game settings',
    )
  })

  it('throws an error if the game has already started', () => {
    const room = createMockRoom({
      id: 'ROOM1',
      hostId: 'H1',
      stage: 'playing',
      impostorHasHint: true,
    })

    expect(() => toggleImpostorHint(room, 'H1')).toThrow(
      'Cannot change settings after the game has started',
    )
  })
})
