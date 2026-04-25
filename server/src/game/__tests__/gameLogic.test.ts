import { GameRoom } from '@impostor/types'
import { describe, expect, it } from 'vitest'
import { startGame, submitRoundDecision } from '../gameLogic'

function createMockRoom(overrides: Partial<GameRoom> = {}): GameRoom {
  return {
    id: 'ROOM1',
    hostId: 'HOST1',
    stage: 'playing',
    sharedWord: 'dog',
    fakeWord: 'cat',
    roundNumber: 1,
    votes: [],
    roundDecisions: [],
    players: [
      { id: 'P1', name: 'Alice', word: 'dog', isImpostor: false },
      { id: 'P2', name: 'Bob', word: 'dog', isImpostor: false },
      { id: 'P3', name: 'Charlie', word: 'cat', isImpostor: true },
    ],
    ...overrides,
  }
}

describe('startGame', () => {
  it('sets stage to playing and resets game state', () => {
    const room = createMockRoom()
    const result = startGame(room)

    expect(result.stage).toBe('playing')
    expect(result.roundNumber).toBe(1)
    expect(result.votes).toEqual([])
    expect(result.roundDecisions).toEqual([])
  })

  it('assigns exactly one impostor', () => {
    const room = createMockRoom()
    const result = startGame(room)

    const impostors = result.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(1)
  })

  it('populates sharedWord and fakeWord on the room', () => {
    const room = createMockRoom()
    const result = startGame(room)

    expect(result.fakeWord).not.toBe('')
    expect(result.sharedWord).not.toBe('')
  })

  it('assigns correct words based on roles', () => {
    const room = createMockRoom()
    const result = startGame(room)

    const impostor = result.players.find((p) => p.isImpostor)!
    const others = result.players.filter((p) => !p.isImpostor)

    // impostor must get fake word
    expect(impostor.word).toBe(result.fakeWord)

    // others must get shared word
    others.forEach((p) => {
      expect(p.word).toBe(result.sharedWord)
    })

    // sanity check: words must differ
    expect(result.fakeWord).not.toBe(result.sharedWord)
  })

  it('preserves number of players', () => {
    const room = createMockRoom()
    const result = startGame(room)

    expect(result.players.length).toBe(room.players.length)
  })

  it('does not mutate original room object', () => {
    const room = createMockRoom()
    const snapshot = structuredClone(room)

    startGame(room)

    expect(room).toEqual(snapshot)
  })
})

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
