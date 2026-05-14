import type { PlayerGameData, PublicGameRoom } from '@impostor/types'
import { useState } from 'react'

interface Props {
  playerId: string
  playerData: PlayerGameData
  room: PublicGameRoom
  onSubmitDescription: (roomId: string, text: string) => void
  onSubmitDecision: (roomId: string, choice: 'skip' | 'vote') => void
}

const GameScreen = ({
  playerId,
  playerData,
  room,
  onSubmitDescription,
  onSubmitDecision,
}: Props) => {
  const [text, setText] = useState('')
  const currentPlayerTurnId = room.descriptionOrder[room.descriptions.length]
  const allPlayersDescribed =
    room.descriptions.length === room.descriptionOrder.length

  return (
    <div>
      <p>Round {room.roundNumber}</p>
      <p>You are {playerData.isImpostor ? '' : 'not'} the impostor</p>
      <p>Your word is: {playerData.word}</p>
      <p>
        It is currently{' '}
        {room.players.find((player) => player.id === currentPlayerTurnId)?.name}{' '}
        turn
      </p>
      <div>
        <p>Players: </p>
        <ul>
          {room.descriptionOrder.map((id) => {
            const player = room.players.find((p) => p.id === id)
            const description = room.descriptions.find((d) => d.playerId === id)
            return (
              <li key={id}>
                {player?.name} {description?.text}
              </li>
            )
          })}
        </ul>
      </div>
      {playerId === currentPlayerTurnId && (
        <div>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Input description...'
          />
          <button
            onClick={() => {
              onSubmitDescription(room.id, text)
              setText('')
            }}
          >
            Submit
          </button>
        </div>
      )}
      {allPlayersDescribed && (
        <div>
          <button onClick={() => onSubmitDecision(room.id, 'vote')}>
            Vote
          </button>

          <button onClick={() => onSubmitDecision(room.id, 'skip')}>
            Skip
          </button>
        </div>
      )}
    </div>
  )
}

export default GameScreen
