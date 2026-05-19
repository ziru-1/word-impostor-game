import { describe, expect, it } from 'vitest'
import { sendMessage } from '../gameLogic'
import { createMockRoom } from '../../__tests__/testHelper'

describe('sendMessage', () => {
  it('throws if sender is not a player in the room', () => {
    const room = createMockRoom()
    expect(() => sendMessage(room, 'UNKNOWN', 'hello')).toThrow(
      'Sender is not a player in this room',
    )
  })

  it('throws if message is empty', () => {
    const room = createMockRoom()
    expect(() => sendMessage(room, 'P1', '')).toThrow('Message cannot be empty')
  })

  it('throws if message is only whitespace', () => {
    const room = createMockRoom()
    expect(() => sendMessage(room, 'P1', '   ')).toThrow(
      'Message cannot be empty',
    )
  })

  it('adds the new message to the end of chatMessages', () => {
    const room = createMockRoom()
    const updatedRoom = sendMessage(room, 'P1', 'hello')
    expect(updatedRoom.chatMessages).toHaveLength(1)
    expect(updatedRoom.chatMessages[0].message).toBe('hello')
  })

  it('trims leading and trailing whitespace from the message', () => {
    const room = createMockRoom()
    const updatedRoom = sendMessage(room, 'P1', '  hello  ')
    expect(updatedRoom.chatMessages[0].message).toBe('hello')
  })

  it('assigns the correct playerId and playerName to the message', () => {
    const room = createMockRoom()
    const updatedRoom = sendMessage(room, 'P1', 'hello')
    expect(updatedRoom.chatMessages[0].playerId).toBe('P1')
    expect(updatedRoom.chatMessages[0].playerName).toBe('Alice')
  })

  it('returns a new room object without mutating the original', () => {
    const room = createMockRoom()
    const updatedRoom = sendMessage(room, 'P1', 'hello')
    expect(updatedRoom).not.toBe(room)
    expect(room.chatMessages).toHaveLength(0)
  })
})
