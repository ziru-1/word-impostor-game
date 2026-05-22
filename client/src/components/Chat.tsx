import type { PublicGameRoom } from '@impostor/types'
import { useState } from 'react'

interface Props {
  room: PublicGameRoom
  onSendMessage: (roomId: string, message: string) => void
}

const Chat = ({ room, onSendMessage }: Props) => {
  const [message, setMessage] = useState<string>('')

  return (
    <div>
      <h3>Chat</h3>
      <ul>
        {room.chatMessages.map((m, index) => (
          <li key={index}>
            <strong>{m.playerName}:</strong> {m.text}
          </li>
        ))}
      </ul>

      <input
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Send message...'
      />
      <button
        onClick={() => {
          onSendMessage(room.id, message)
          setMessage('')
        }}
      >
        Send
      </button>
    </div>
  )
}

export default Chat
