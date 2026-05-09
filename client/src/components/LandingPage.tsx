import { useState } from 'react'

interface Props {
  onCreateRoom: (name: string) => void
  onJoinRoom: (name: string, roomId: string) => void
}

export default function LandingPage({ onCreateRoom, onJoinRoom }: Props) {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  return (
    <div>
      <input
        placeholder='Your name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => onCreateRoom(name)}>Create Room</button>
      <input
        placeholder='Room code'
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={() => onJoinRoom(name, roomCode)}>Join Room</button>
    </div>
  )
}
