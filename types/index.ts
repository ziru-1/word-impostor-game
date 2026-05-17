export interface Player {
  id: string
  name: string
  word: string
  isImpostor: boolean
}

export type PublicPlayer = Omit<Player, 'word' | 'isImpostor'>

export interface PlayerGameData {
  word: string
  isImpostor: boolean
}

export interface GameReveal {
  impostorId: Player['id']
  sharedWord: string
  fakeWord: string
}

export type GameStage = 'lobby' | 'playing' | 'voting' | 'results'

export interface Vote {
  voterId: Player['id']
  targetId: Player['id']
}

export interface RoundDecision {
  playerId: Player['id']
  choice: 'skip' | 'vote'
}

export interface PlayerDescription {
  playerId: Player['id']
  text: string
}

export interface GameRoom {
  id: string
  hostId: string

  players: Player[]

  stage: GameStage
  roundNumber: number

  descriptionOrder: string[]
  descriptions: PlayerDescription[]
  allDescriptions: PlayerDescription[][]

  roundDecisions: RoundDecision[]
  votes: Vote[]

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

export interface PlayerDescriptionPayload {
  roomId: string
  text: string
}
