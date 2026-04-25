import { GameRoom } from '@impostor/types'
import { wordPairs } from './words'

export function startGame(room: GameRoom): GameRoom {
  const wordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)]
  const impostorIndex = Math.floor(Math.random() * room.players.length)
  const updatedPlayers = room.players.map((player, index) => ({
    ...player,
    word: index === impostorIndex ? wordPair.fakeWord : wordPair.sharedWord,
    isImpostor: index === impostorIndex,
  }))

  const updatedRoom: GameRoom = {
    ...room,
    players: updatedPlayers,
    sharedWord: wordPair.sharedWord,
    fakeWord: wordPair.fakeWord,
    stage: 'playing',
    roundNumber: 1,
    votes: [],
    roundDecision: [],
  }

  return updatedRoom
}

// export function submitRoundDecision(
//   room: GameRoom,
//   playerId: string,
//   choice: 'skip' | 'vote',
// ): GameRoom {}

// export function castVote(
//   room: GameRoom,
//   voterId: string,
//   targetId: string,
// ): GameRoom {}
