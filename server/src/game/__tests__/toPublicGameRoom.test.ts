import { describe, expect, it } from 'vitest'
import { createMockRoom } from '../../__tests__/testHelper'
import { toPublicGameRoom } from '../roomManager'

const mockRoom = createMockRoom({
  stage: 'lobby',
  sharedWord: 'secret-word',
  fakeWord: 'fake-word',
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
    expect(publicRoom.roundDecisions).toEqual(mockRoom.roundDecisions)
  })
})
