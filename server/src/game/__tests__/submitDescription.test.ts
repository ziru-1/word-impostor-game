import { describe, expect, it } from 'vitest'
import { createMockRoom } from '../../__tests__/testHelper'
import { submitDescription } from '../gameLogic'

describe('submitDescription', () => {
  it('throws if game is not in playing stage', () => {
    const room = createMockRoom({ stage: 'voting' })
    expect(() => submitDescription(room, 'P1', 'my description')).toThrow(
      'Game is not in playing stage',
    )
  })

  it('throws if description text is empty', () => {
    const room = createMockRoom()
    expect(() => submitDescription(room, 'P1', '   ')).toThrow(
      'Description cannot be empty',
    )
  })

  it("throws if it is not the player's turn", () => {
    const room = createMockRoom()
    expect(() => submitDescription(room, 'P2', 'my description')).toThrow(
      "It's not this player's turn",
    )
  })

  it('throws if no more players are expected to submit', () => {
    const room = createMockRoom({
      descriptions: [
        { playerId: 'P1', text: 'first' },
        { playerId: 'P2', text: 'second' },
        { playerId: 'P3', text: 'third' },
      ],
    })
    expect(() => submitDescription(room, 'P1', 'extra')).toThrow(
      'No more players expected to submit',
    )
  })

  it('returns room with updated descriptions', () => {
    const room = createMockRoom()
    const updatedRoom = submitDescription(room, 'P1', 'my description')
    expect(updatedRoom.descriptions).toHaveLength(1)
    expect(updatedRoom.descriptions[0]).toEqual({
      playerId: 'P1',
      text: 'my description',
    })
  })
})
