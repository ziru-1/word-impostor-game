export type PlayerId = string

export interface Player {
  id: PlayerId
  name: string
  word: string
  isImpostor: boolean
}

export type PublicPlayer = Omit<Player, 'word' | 'isImpostor'>

export interface ChatMessage {
  playerId: PlayerId
  playerName: string
  text: string
}

export interface PlayerGameData {
  word: string
  isImpostor: boolean
}

export interface GameReveal {
  impostorId: PlayerId
  impostorHasHint: boolean
  sharedWord: string
  fakeWord: string
}

export type GameStage = 'lobby' | 'playing' | 'voting' | 'results'

export interface Vote {
  voterId: PlayerId
  targetId: PlayerId
}

export interface RoundDecision {
  playerId: PlayerId
  choice: 'skip' | 'vote'
}

export interface PlayerDescription {
  playerId: PlayerId
  text: string
}

export interface GameRoom {
  id: string
  hostId: PlayerId

  players: Player[]
  chatMessages: ChatMessage[]

  impostorHasHint: boolean

  stage: GameStage
  roundNumber: number

  descriptionOrder: PlayerId[]
  descriptions: PlayerDescription[]
  allDescriptions: PlayerDescription[][]

  roundDecisions: RoundDecision[]
  votes: Vote[]

  sharedWord: string
  fakeWord: string

  votedOutPlayerId: PlayerId | null

  playAgainPlayerIds: PlayerId[]
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
export interface ToggleImpostorHintPayload {
  roomId: string
}

export interface SendMessagePayload {
  roomId: string
  message: string
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
  targetId: PlayerId
}

export interface PlayerDescriptionPayload {
  roomId: string
  text: string
}

export interface PlayAgainPayload {
  roomId: string
}
