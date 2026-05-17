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
  const allPlayersDescribed = room.allDescriptions.length === room.roundNumber
  const currentDescriptions = allPlayersDescribed
    ? room.allDescriptions[room.roundNumber - 1]
    : room.descriptions

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

            const description = currentDescriptions.find(
              (d) => d.playerId === id,
            )
            return (
              <li key={id}>
                {player?.name} {description?.text}
              </li>
            )
          })}
        </ul>
      </div>
      {playerId === currentPlayerTurnId && !allPlayersDescribed && (
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

      {room.allDescriptions.slice(0, room.roundNumber - 1).length > 0 && (
        <div>
          <h3>Previous Descriptions</h3>

          {room.allDescriptions
            .slice(0, room.roundNumber - 1)
            .map((roundDescriptions, index) => (
              <div key={index}>
                <h4>Round {index + 1}</h4>

                <ul>
                  {room.descriptionOrder.map((id) => {
                    const player = room.players.find((p) => p.id === id)

                    const description = roundDescriptions.find(
                      (d) => d.playerId === id,
                    )

                    return (
                      <li key={id}>
                        <strong>{player?.name}:</strong>{' '}
                        {description?.text ?? 'No description'}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default GameScreen
