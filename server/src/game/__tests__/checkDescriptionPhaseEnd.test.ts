import { describe, expect, it } from 'vitest'
import { checkDescriptionPhaseEnd } from '../gameLogic'
import { createMockRoom } from '../../__tests__/testHelper'

describe('checkDescriptionPhaseEnd', () => {
  it('returns room unchanged if not all players have described', () => {
    const room = createMockRoom({
      descriptionOrder: ['P1', 'P2'],
      descriptions: [{ playerId: 'P1', text: 'first' }],
    })

    const updatedRoom = checkDescriptionPhaseEnd(room)

    expect(updatedRoom).toEqual(room)
  })

  it('resets descriptions and pushes them into allDescriptions when all players have described', () => {
    const descriptions = [
      { playerId: 'P1', text: 'first' },
      { playerId: 'P2', text: 'second' },
    ]

    const room = createMockRoom({
      descriptionOrder: ['P1', 'P2'],
      descriptions: descriptions,
      allDescriptions: [],
    })

    const updatedRoom = checkDescriptionPhaseEnd(room)

    expect(updatedRoom.allDescriptions).toHaveLength(1)
    expect(updatedRoom.allDescriptions[0]).toEqual(descriptions)
    expect(updatedRoom.descriptions).toEqual([])
  })
})
