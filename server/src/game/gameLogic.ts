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
    roundDecisions: [],
    votedOutPlayerId: null,
  }

  return updatedRoom
}

export function submitRoundDecision(
  room: GameRoom,
  playerId: string,
  choice: 'skip' | 'vote',
): GameRoom {
  if (room.roundDecisions.some((player) => player.playerId === playerId)) {
    throw new Error('Player has already voted')
  }

  const updatedRoundDecision = room.roundDecisions.concat({ playerId, choice })

  const decisionPlayerIds = new Set(updatedRoundDecision.map((d) => d.playerId))
  const allPlayersDecided = room.players.every((player) =>
    decisionPlayerIds.has(player.id),
  )

  if (!allPlayersDecided) {
    return {
      ...room,
      roundDecisions: updatedRoundDecision,
    }
  }

  let voteCount = 0
  let skipCount = 0

  for (const d of updatedRoundDecision) {
    if (d.choice === 'vote') voteCount++
    else if (d.choice === 'skip') skipCount++
  }

  const majorityVote = voteCount > skipCount
  const isFinalRound = room.roundNumber === 3

  if (majorityVote || isFinalRound) {
    return {
      ...room,
      roundDecisions: updatedRoundDecision,
      stage: 'voting',
    }
  }

  return {
    ...room,
    roundNumber: room.roundNumber + 1,
    roundDecisions: [],
  }
}

export function castVote(
  room: GameRoom,
  voterId: string,
  targetId: string,
): GameRoom {
  if (room.stage !== 'voting') {
    throw new Error('Game stage must be in voting')
  }

  if (voterId === targetId) {
    throw new Error("Player can't vote themselves")
  }

  const targetExists = room.players.some((p) => p.id === targetId)
  if (!targetExists) {
    throw new Error('Target player not found in room')
  }

  if (room.votes.some((player) => player.voterId === voterId)) {
    throw new Error('Player has already voted')
  }

  const updatedVotes = room.votes.concat({ voterId, targetId })

  const votesVoterIds = new Set(updatedVotes.map((d) => d.voterId))
  const allPlayersVoted = room.players.every((player) =>
    votesVoterIds.has(player.id),
  )

  if (!allPlayersVoted) {
    return {
      ...room,
      votes: updatedVotes,
    }
  }

  let maxVotes = 0
  let leaders: string[] = []

  const voteCounts: Record<string, number> = {}

  for (const vote of updatedVotes) {
    const count = (voteCounts[vote.targetId] || 0) + 1
    voteCounts[vote.targetId] = count

    if (count > maxVotes) {
      maxVotes = count
      leaders = [vote.targetId]
    } else if (count === maxVotes) {
      leaders.push(vote.targetId)
    }
  }

  const votedOutPlayerId =
    leaders.length === 1
      ? leaders[0]
      : leaders[Math.floor(Math.random() * leaders.length)]

  return {
    ...room,
    votes: updatedVotes,
    votedOutPlayerId,
    stage: 'results',
  }
}
