import { describe, expect, it, beforeEach } from 'vitest'
import { resetRoomToLobby, rooms } from '../roomManager'
import { createMockRoom } from '../../__tests__/testHelper'

describe('resetRoomToLobby', () => {
  beforeEach(() => {
    rooms.clear()
  })

  it('completely resets the game room metrics back to the lobby state', () => {
    const players = [
      { id: 'P1', name: 'Alice', word: 'apple', isImpostor: false },
      { id: 'P2', name: 'Bob', word: 'banana', isImpostor: true },
    ]
    const room = createMockRoom({
      id: 'ROOM1',
      stage: 'results',
      roundNumber: 3,
      descriptionOrder: ['P1', 'P2'],
      descriptions: [{ playerId: 'P1', text: 'round' }],
      allDescriptions: [[{ playerId: 'P1', text: 'round' }]],
      roundDecisions: [{ playerId: 'P1', choice: 'vote' }],
      votes: [{ voterId: 'P1', targetId: 'P2' }],
      sharedWord: 'apple',
      fakeWord: 'banana',
      votedOutPlayerId: 'P2',
      playAgainPlayerIds: ['P1'],
      players,
    })
    rooms.set('ROOM1', room)

    const result = resetRoomToLobby(room)

    expect(result.stage).toBe('lobby')
    expect(result.roundNumber).toBe(1)
    expect(result.descriptionOrder).toEqual([])
    expect(result.descriptions).toEqual([])
    expect(result.allDescriptions).toEqual([])
    expect(result.roundDecisions).toEqual([])
    expect(result.votes).toEqual([])
    expect(result.sharedWord).toBe('')
    expect(result.fakeWord).toBe('')
    expect(result.votedOutPlayerId).toBeNull()
    expect(result.playAgainPlayerIds).toEqual([])

    expect(result.players[0].word).toBe('')
    expect(result.players[0].isImpostor).toBe(false)
    expect(result.players[1].word).toBe('')
    expect(result.players[1].isImpostor).toBe(false)

    expect(rooms.get('ROOM1')).toEqual(result)
  })
})
