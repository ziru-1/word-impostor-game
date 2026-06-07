import { describe, expect, it, beforeEach } from 'vitest'
import { kickPlayerFromRoom, rooms } from '../roomManager'
import { createMockRoom } from '../../__tests__/testHelper'

describe('kickPlayerFromRoom', () => {
  beforeEach(() => {
    rooms.clear()
  })

  it('allows the host to kick a player while in the lobby', () => {
    const host = { id: 'H1', name: 'Host', word: '', isImpostor: false }
    const target = { id: 'T1', name: 'Target', word: '', isImpostor: false }
    const room = createMockRoom({
      id: 'ROOM1',
      hostId: 'H1',
      stage: 'lobby',
      players: [host, target],
      chatMessages: [],
    })
    rooms.set('ROOM1', room)

    const result = kickPlayerFromRoom('ROOM1', 'H1', 'T1')

    expect(result.players).toHaveLength(1)
    expect(result.players[0].id).toBe('H1')
    expect(result.chatMessages).toHaveLength(1)
    expect(result.chatMessages[0].text).toBe(
      'Target was kicked from the room by the host.',
    )
    expect(rooms.get('ROOM1')).toEqual(result)
  })

  it('throws an error if a non-host attempts to kick', () => {
    const room = createMockRoom({ id: 'ROOM1', hostId: 'H1', stage: 'lobby' })
    rooms.set('ROOM1', room)

    expect(() => kickPlayerFromRoom('ROOM1', 'T1', 'H1')).toThrow(
      'Only the host can kick players',
    )
  })

  it('throws an error if the game is not in the lobby stage', () => {
    const room = createMockRoom({ id: 'ROOM1', hostId: 'H1', stage: 'playing' })
    rooms.set('ROOM1', room)

    expect(() => kickPlayerFromRoom('ROOM1', 'H1', 'T1')).toThrow(
      'Players can only be kicked while in the lobby',
    )
  })

  it('throws an error if the host tries to kick themselves', () => {
    const room = createMockRoom({ id: 'ROOM1', hostId: 'H1', stage: 'lobby' })
    rooms.set('ROOM1', room)

    expect(() => kickPlayerFromRoom('ROOM1', 'H1', 'H1')).toThrow(
      'You cannot kick yourself',
    )
  })

  it('throws an error if the target player is not in the room', () => {
    const host = { id: 'H1', name: 'Host', word: '', isImpostor: false }
    const room = createMockRoom({
      id: 'ROOM1',
      hostId: 'H1',
      stage: 'lobby',
      players: [host],
    })
    rooms.set('ROOM1', room)

    expect(() => kickPlayerFromRoom('ROOM1', 'H1', 'T1')).toThrow(
      'Player not found in room',
    )
  })
})
