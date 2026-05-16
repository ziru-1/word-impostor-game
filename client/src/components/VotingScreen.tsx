import type { PublicGameRoom } from '@impostor/types'

interface Props {
  playerId: string
  room: PublicGameRoom
  onCastVote: (roomId: string, targetId: string) => void
}

const VotingScreen = ({ playerId, room, onCastVote }: Props) => {
  const playerHasVoted = room.votes.some((vote) => vote.voterId === playerId)

  return (
    <div>
      <div>
        <h4>Vote on the impostor</h4>
        <div>
          <p>Players: </p>
          <ul>
            {room.descriptionOrder.map((id) => {
              const player = room.players.find((p) => p.id === id)

              return (
                <li key={id}>
                  {player?.name}{' '}
                  {!playerHasVoted && id !== playerId && (
                    <button onClick={() => onCastVote(room.id, id)}>
                      Vote
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {room.allDescriptions.map((roundDescriptions, index) => (
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
  )
}

export default VotingScreen
