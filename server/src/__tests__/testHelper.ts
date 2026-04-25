import { GameRoom } from '@impostor/types'

export function createMockRoom(overrides: Partial<GameRoom> = {}): GameRoom {
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
