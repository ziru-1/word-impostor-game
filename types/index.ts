export interface Player {
  id: string
  name: string
  word: string
  isImpostor: boolean
}

export type PublicPlayer = Omit<Player, 'word' | 'isImpostor'>

export type GameStage = 'lobby' | 'playing' | 'voting' | 'results'

export interface Vote {
  voterId: Player['id']
  targetId: Player['id']
}

export interface RoundDecision {
  playerId: Player['id']
  choice: 'skip' | 'vote'
}

export interface GameRoom {
  id: string
  hostId: string
  players: Player[]
  roundNumber: number
  votes: Vote[]
  roundDecisions: RoundDecision[]
  stage: GameStage
  sharedWord: string
  fakeWord: string
  votedOutPlayerId: string | null
}

export type PublicGameRoom = Omit<
  GameRoom,
  'sharedWord' | 'fakeWord' | 'players'
> & {
  players: PublicPlayer[]
}

export interface CreateRoomPayload {
  name: string
}

export interface JoinRoomPayload {
  name: string
  roomId: string
}

export interface StartGamePayload {
  roomId: string
}

export interface SubmitDecisionPayload {
  roomId: string
  choice: 'skip' | 'vote'
}

export interface CastVotePayload {
  roomId: string
  targetId: string
}

export interface LeaveRoomPayload {
  roomId: string
}
