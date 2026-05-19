import { describe, expect, it } from 'vitest'
import { submitPlayAgain } from '../gameLogic'
import { createMockRoom } from '../../__tests__/testHelper'

describe('submitPlayAgain', () => {
  it('throws if game stage is not results', () => {
    const room = createMockRoom({ stage: 'voting' })
    expect(() => submitPlayAgain(room, 'P1')).toThrow(
      'Game stage must be in results',
    )
  })

  it('throws if player has already clicked play again', () => {
    const room = createMockRoom({
      stage: 'results',
      playAgainPlayerIds: ['P1'],
    })
    expect(() => submitPlayAgain(room, 'P1')).toThrow(
      'Player has already played again',
    )
  })

  it('appends player id and keeps stage as results when not all players have clicked', () => {
    const room = createMockRoom({ stage: 'results' })
    const updatedRoom = submitPlayAgain(room, 'P1')
    expect(updatedRoom.playAgainPlayerIds).toContain('P1')
    expect(updatedRoom.stage).toBe('results')
  })

  it('changes stage to lobby when all players have clicked play again', () => {
    const room = createMockRoom({
      stage: 'results',
      playAgainPlayerIds: ['P1', 'P2'],
    })
    const updatedRoom = submitPlayAgain(room, 'P3')
    expect(updatedRoom.stage).toBe('lobby')
  })
})
