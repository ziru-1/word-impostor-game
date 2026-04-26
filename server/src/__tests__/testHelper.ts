import { GameRoom, Player } from '@impostor/types'

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
      createMockPlayer({ id: 'P1', name: 'Alice' }),
      createMockPlayer({ id: 'P2', name: 'Bob' }),
      createMockPlayer({
        id: 'P3',
        name: 'Charlie',
        isImpostor: true,
        word: 'cat',
      }),
    ],
    votedOutPlayerId: null,
    ...overrides,
  }
}

export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'P1',
    name: 'Test Player',
    word: 'dog',
    isImpostor: false,
    ...overrides,
  }
}
