export interface Player {
  id: string
  name: string
  hasVoted: boolean
  word: string
  isImpostor: boolean
}

export type PublicPlayer = Omit<Player, 'word' | 'isImpostor'>

export type GameStage = 'lobby' | 'playing' | 'voting' | 'results'

export interface GameRoom {
  id: string
  hostId: string
  players: PublicPlayer[]
  sharedWord: string
  fakeWord: string
  stage: GameStage
}
