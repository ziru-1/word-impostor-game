import { describe, expect, it } from 'vitest'
import { createMockRoom } from '../../__tests__/testHelper'
import { castVote } from '../gameLogic'

describe('castVote', () => {
  it('throws if stage is not voting', () => {
    const room = createMockRoom({ stage: 'playing' })
    expect(() => castVote(room, 'P1', 'P2')).toThrow(
      'Game stage must be in voting',
    )
  })

  it('throws if voter and target are the same player', () => {
    const room = createMockRoom({ stage: 'voting' })
    expect(() => castVote(room, 'P1', 'P1')).toThrow(
      "Player can't vote themselves",
    )
  })

  it('throws if target does not exist in room', () => {
    const room = createMockRoom({ stage: 'voting' })
    expect(() => castVote(room, 'P1', 'INVALID')).toThrow(
      'Target player not found in room',
    )
  })

  it('throws if player has already voted', () => {
    const room = createMockRoom({
      stage: 'voting',
      votes: [{ voterId: 'P1', targetId: 'P2' }],
    })
    expect(() => castVote(room, 'P1', 'P2')).toThrow('Player has already voted')
  })

  it('adds vote to room when not all players have voted', () => {
    const room = createMockRoom({ stage: 'voting' })
    const result = castVote(room, 'P1', 'P2')

    expect(result.votes).toHaveLength(1)
    expect(result.stage).toBe('voting')
  })

  it('moves to results and sets votedOutPlayerId when all players vote', () => {
    const room = createMockRoom({
      stage: 'voting',
      votes: [
        { voterId: 'P1', targetId: 'P3' },
        { voterId: 'P2', targetId: 'P3' },
      ],
    })
    const result = castVote(room, 'P3', 'P1')

    expect(result.stage).toBe('results')
    expect(result.votedOutPlayerId).toBe('P3')
    expect(result.votes).toHaveLength(3)
  })

  it('resolves tie by picking one of the tied players', () => {
    const room = createMockRoom({
      stage: 'voting',
      votes: [
        { voterId: 'P1', targetId: 'P2' },
        { voterId: 'P2', targetId: 'P3' },
      ],
    })
    const result = castVote(room, 'P3', 'P1')

    expect(result.stage).toBe('results')
    expect(['P1', 'P2', 'P3']).toContain(result.votedOutPlayerId)
  })

  it('does not mutate the original room', () => {
    const room = createMockRoom({ stage: 'voting' })
    const snapshot = structuredClone(room)

    castVote(room, 'P1', 'P2')

    expect(room).toEqual(snapshot)
  })
})
