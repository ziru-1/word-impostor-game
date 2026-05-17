import type { GameReveal, PublicGameRoom } from '@impostor/types'

interface Props {
  room: PublicGameRoom
  reveal: GameReveal
}

const ResultsScreen = ({ room, reveal }: Props) => {
  const votedOutPlayer = room.players.find(
    (player) => player.id === room.votedOutPlayerId,
  )
  const impostor = room.players.find(
    (player) => player.id === reveal.impostorId,
  )
  return (
    <div>
      <div>
        <h4>Votes:</h4>
        {room.votes.map((vote) => {
          const voterName = room.players.find(
            (p) => p.id === vote.voterId,
          )?.name
          const targetName = room.players.find(
            (p) => p.id === vote.targetId,
          )?.name

          return (
            <li key={vote.voterId}>
              <strong>{voterName}</strong> {' => '}
              <strong>{targetName}</strong>
            </li>
          )
        })}
        <p>Shared word: {reveal.sharedWord}</p>
        <p>Fake word: {reveal.fakeWord}</p>
        <p>Voted out player: {votedOutPlayer?.name}</p>
        <p>Impostor: {impostor?.name}</p>
        <h3>
          IMPOSTOR {votedOutPlayer?.id === impostor?.id ? 'LOSES' : 'WINS'}
        </h3>
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

export default ResultsScreen
