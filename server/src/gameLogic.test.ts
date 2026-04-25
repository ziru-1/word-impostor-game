import { GameRoom } from '@impostor/types'
import { describe, expect, it } from 'vitest'
import { startGame } from './gameLogic'

function createMockRoom(): GameRoom {
  return {
    id: 'ROOM1',
    hostId: 'HOST1',
    stage: 'lobby',
    sharedWord: '',
    fakeWord: '',
    roundNumber: 1,
    votes: [],
    roundDecision: [],
    players: [
      { id: 'HOST1', name: 'Host', word: '', isImpostor: false },
      { id: 'P1', name: 'Alice', word: '', isImpostor: false },
      { id: 'P2', name: 'Bob', word: '', isImpostor: false },
    ],
  }
}

describe('startGame', () => {
  it('sets stage to playing and resets game state', () => {
    const room = createMockRoom()
    const result = startGame(room)

    expect(result.stage).toBe('playing')
    expect(result.roundNumber).toBe(1)
    expect(result.votes).toEqual([])
    expect(result.roundDecision).toEqual([])
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
