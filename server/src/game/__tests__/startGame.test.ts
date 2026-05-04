import { describe, expect, it } from 'vitest'
import { createMockPlayer, createMockRoom } from '../../__tests__/testHelper'
import { startGame } from '../gameLogic'

describe('startGame', () => {
  it('throws if less than 3 players', () => {
    const room = createMockRoom({
      players: [createMockPlayer({ id: 'P1' }), createMockPlayer({ id: 'P2' })],
    })
    expect(() => startGame(room, 'HOST1')).toThrow('Need at least 3 players')
  })

  it('throws if requester is not the host', () => {
    const room = createMockRoom()
    expect(() => startGame(room, 'P1')).toThrow('Only host can start game')
  })

  it('sets stage to playing and resets game state', () => {
    const room = createMockRoom()
    const result = startGame(room, 'HOST1')

    expect(result.stage).toBe('playing')
    expect(result.roundNumber).toBe(1)
    expect(result.votes).toEqual([])
    expect(result.roundDecisions).toEqual([])
  })

  it('assigns exactly one impostor', () => {
    const room = createMockRoom()
    const result = startGame(room, 'HOST1')

    const impostors = result.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(1)
  })

  it('populates sharedWord and fakeWord on the room', () => {
    const room = createMockRoom()
    const result = startGame(room, 'HOST1')

    expect(result.fakeWord).not.toBe('')
    expect(result.sharedWord).not.toBe('')
  })

  it('assigns correct words based on roles', () => {
    const room = createMockRoom()
    const result = startGame(room, 'HOST1')

    const impostor = result.players.find((p) => p.isImpostor)!
    const others = result.players.filter((p) => !p.isImpostor)

    expect(impostor.word).toBe(result.fakeWord)
    others.forEach((p) => {
      expect(p.word).toBe(result.sharedWord)
    })
    expect(result.fakeWord).not.toBe(result.sharedWord)
  })

  it('preserves number of players', () => {
    const room = createMockRoom()
    const result = startGame(room, 'HOST1')

    expect(result.players.length).toBe(room.players.length)
  })

  it('does not mutate original room object', () => {
    const room = createMockRoom()
    const snapshot = structuredClone(room)

    startGame(room, 'HOST1')

    expect(room).toEqual(snapshot)
  })
})
