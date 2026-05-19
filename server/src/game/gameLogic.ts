import { GameRoom, PlayerDescription } from '@impostor/types'
import { wordPairs } from './words'

export function startGame(room: GameRoom, requesterId: string): GameRoom {
  if (room.players.length < 3) throw new Error('Need at least 3 players')
  if (requesterId !== room.hostId) throw new Error('Only host can start game')

  const wordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)]

  const impostorIndex = Math.floor(Math.random() * room.players.length)

  const updatedPlayers = room.players.map((player, index) => ({
    ...player,
    word: index === impostorIndex ? wordPair.fakeWord : wordPair.sharedWord,
    isImpostor: index === impostorIndex,
  }))

  const descriptionOrder = updatedPlayers.map((player) => player.id)

  // Fisher-Yates shuffle
  for (let i = descriptionOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[descriptionOrder[i], descriptionOrder[j]] = [
      descriptionOrder[j],
      descriptionOrder[i],
    ]
  }

  return {
    ...room,
    players: updatedPlayers,

    stage: 'playing',
    roundNumber: 1,

    sharedWord: wordPair.sharedWord,
    fakeWord: wordPair.fakeWord,

    descriptionOrder,
    descriptions: [],
    allDescriptions: [],

    votes: [],
    roundDecisions: [],
    votedOutPlayerId: null,
    playAgainPlayerIds: [],
  }
}

export function checkDescriptionPhaseEnd(room: GameRoom): GameRoom {
  const allPlayersDescribed =
    room.descriptions.length === room.descriptionOrder.length
  const isFinalRound = room.roundNumber === 3

  if (allPlayersDescribed) {
    if (isFinalRound) {
      return {
        ...room,
        allDescriptions: room.allDescriptions.concat([room.descriptions]),
        stage: 'voting',
      }
    } else {
      return {
        ...room,
        allDescriptions: room.allDescriptions.concat([room.descriptions]),
        descriptions: [],
      }
    }
  }

  return room
}

export function submitDescription(
  room: GameRoom,
  playerId: string,
  text: string,
): GameRoom {
  if (room.stage !== 'playing') {
    throw new Error('Game is not in playing stage')
  }

  if (!text || text.trim() === '') {
    throw new Error('Description cannot be empty')
  }

  const currentIndex = room.descriptions.length
  const expectedPlayerId = room.descriptionOrder[currentIndex]

  if (!expectedPlayerId) {
    throw new Error('No more players expected to submit')
  }

  if (playerId !== expectedPlayerId) {
    throw new Error("It's not this player's turn")
  }

  const newDescription: PlayerDescription = {
    playerId,
    text: text.trim(),
  }

  const updatedDescriptions = room.descriptions.concat(newDescription)

  return {
    ...room,
    descriptions: updatedDescriptions,
  }
}

export function submitRoundDecision(
  room: GameRoom,
  playerId: string,
  choice: 'skip' | 'vote',
): GameRoom {
  if (room.roundDecisions.some((player) => player.playerId === playerId))
    throw new Error('Player has already voted')

  if (!(choice === 'skip' || choice === 'vote'))
    throw new Error('Decisions should only be either skip or vote')

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

  if (majorityVote) {
    return {
      ...room,
      roundDecisions: updatedRoundDecision,
      stage: 'voting',
    }
  }

  return {
    ...room,
    roundNumber: room.roundNumber + 1,
    descriptions: [],
    roundDecisions: [],
  }
}

export function castVote(
  room: GameRoom,
  voterId: string,
  targetId: string,
): GameRoom {
  if (room.stage !== 'voting') throw new Error('Game stage must be in voting')

  if (voterId === targetId) throw new Error("Player can't vote themselves")

  const targetExists = room.players.some((p) => p.id === targetId)
  if (!targetExists) throw new Error('Target player not found in room')

  if (room.votes.some((player) => player.voterId === voterId))
    throw new Error('Player has already voted')

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

export function submitPlayAgain(room: GameRoom, playerId: string): GameRoom {
  if (room.stage !== 'results') throw new Error('Game stage must be in results')

  if (room.playAgainPlayerIds.includes(playerId))
    throw new Error('Player has already played again')

  const updatedPlayAgainPlayerIds = room.playAgainPlayerIds.concat(playerId)

  if (updatedPlayAgainPlayerIds.length === room.players.length) {
    return {
      ...room,
      stage: 'lobby',
    }
  }

  return {
    ...room,
    playAgainPlayerIds: updatedPlayAgainPlayerIds,
  }
}

export function sendMessage(
  room: GameRoom,
  senderId: string,
  message: string,
): GameRoom {
  const player = room.players.find((p) => p.id === senderId)
  if (!player) throw new Error('Sender is not a player in this room')

  if (!message || message.trim() === '') {
    throw new Error('Message cannot be empty')
  }

  const newMessage = {
    playerId: senderId,
    playerName: player.name,
    message: message.trim(),
  }

  const updatedMessages = room.chatMessages.concat(newMessage)

  return {
    ...room,
    chatMessages: updatedMessages,
  }
}
