import { describe, expect, it } from 'vitest'
import { checkDescriptionPhaseEnd } from '../gameLogic'
import { createMockRoom } from '../../__tests__/testHelper'

describe('checkDescriptionPhaseEnd', () => {
  it('returns room unchanged if not all players have described', () => {
    const room = createMockRoom({
      descriptions: [{ playerId: 'P1', text: 'first' }],
    })
    const updatedRoom = checkDescriptionPhaseEnd(room)
    expect(updatedRoom).toEqual(room)
  })

  it('transitions to voting and pushes descriptions into allDescriptions on final round', () => {
    const descriptions = [
      { playerId: 'P1', text: 'first' },
      { playerId: 'P2', text: 'second' },
      { playerId: 'P3', text: 'third' },
    ]
    const room = createMockRoom({ roundNumber: 3, descriptions })
    const updatedRoom = checkDescriptionPhaseEnd(room)
    expect(updatedRoom.stage).toBe('voting')
    expect(updatedRoom.allDescriptions).toHaveLength(1)
    expect(updatedRoom.allDescriptions[0]).toEqual(descriptions)
  })

  it('resets descriptions and pushes into allDescriptions when not final round', () => {
    const descriptions = [
      { playerId: 'P1', text: 'first' },
      { playerId: 'P2', text: 'second' },
      { playerId: 'P3', text: 'third' },
    ]
    const room = createMockRoom({ roundNumber: 1, descriptions })
    const updatedRoom = checkDescriptionPhaseEnd(room)
    expect(updatedRoom.descriptions).toEqual([])
    expect(updatedRoom.allDescriptions).toHaveLength(1)
    expect(updatedRoom.allDescriptions[0]).toEqual(descriptions)
    expect(updatedRoom.stage).toBe('playing')
  })
})
