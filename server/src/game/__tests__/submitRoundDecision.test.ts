import { describe, expect, it } from 'vitest'
import { createMockRoom } from '../../__tests__/testHelper'
import { submitRoundDecision } from '../gameLogic'

describe('submitRoundDecision', () => {
  it('throws if player submits a decision twice', () => {
    const room = createMockRoom({
      roundDecisions: [{ playerId: 'P1', choice: 'vote' }],
    })

    expect(() => submitRoundDecision(room, 'P1', 'vote')).toThrow(
      'Player has already voted',
    )
  })

  it('adds decision to roundDecisions when not all players have decided', () => {
    const room = createMockRoom()
    const result = submitRoundDecision(room, 'P1', 'vote')

    expect(result.roundDecisions).toHaveLength(1)
    expect(result.stage).toBe('playing')
  })

  it('changes stage to voting when majority votes to vote', () => {
    const room = createMockRoom({
      roundDecisions: [
        { playerId: 'P1', choice: 'vote' },
        { playerId: 'P2', choice: 'vote' },
      ],
    })

    const result = submitRoundDecision(room, 'P3', 'skip')
    expect(result.stage).toBe('voting')
  })

  it('increments roundNumber and clears roundDecisions when majority skips', () => {
    const room = createMockRoom({
      roundDecisions: [
        { playerId: 'P1', choice: 'skip' },
        { playerId: 'P2', choice: 'skip' },
      ],
    })

    const result = submitRoundDecision(room, 'P3', 'vote')
    expect(result.roundNumber).toBe(2)
    expect(result.roundDecisions).toEqual([])
    expect(result.stage).toBe('playing')
  })

  it('defaults to skip on a tie', () => {
    const room = createMockRoom({
      players: [
        { id: 'P1', name: 'Alice', word: 'dog', isImpostor: false },
        { id: 'P2', name: 'Bob', word: 'dog', isImpostor: false },
      ],
      roundDecisions: [{ playerId: 'P1', choice: 'vote' }],
    })

    const result = submitRoundDecision(room, 'P2', 'skip')
    expect(result.roundNumber).toBe(2)
    expect(result.roundDecisions).toEqual([])
    expect(result.stage).toBe('playing')
  })

  it('forces voting on round 3 regardless of decisions', () => {
    const room = createMockRoom({
      roundNumber: 3,
      roundDecisions: [
        { playerId: 'P1', choice: 'skip' },
        { playerId: 'P2', choice: 'skip' },
      ],
    })

    const result = submitRoundDecision(room, 'P3', 'skip')
    expect(result.stage).toBe('voting')
  })

  it('does not mutate the original room', () => {
    const room = createMockRoom()
    const snapshot = structuredClone(room)

    submitRoundDecision(room, 'P1', 'vote')

    expect(room).toEqual(snapshot)
  })
})
