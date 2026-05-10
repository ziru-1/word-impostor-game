import type { PublicGameRoom } from '@impostor/types'

interface Props {
  room: PublicGameRoom
  playerId: string
  onStartGame: (roomId: string) => void
}

const Lobby = ({ room, playerId, onStartGame }: Props) => {
  return (
    <div>
      <p>Room Code: {room.id}</p>
      <div>
        <p>Players: </p>
        <ul>
          {room.players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>
      {playerId === room.hostId && (
        <button onClick={() => onStartGame(room.id)}>Start</button>
      )}
    </div>
  )
}

export default Lobby
