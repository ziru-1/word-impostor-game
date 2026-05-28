import type { PublicGameRoom } from '@impostor/types'
import { useEffect, useRef, useState } from 'react'
import styles from './Chat.module.css'

interface Props {
  room: PublicGameRoom
  playerId: string
  onSendMessage: (roomId: string, message: string) => void
}

const Chat = ({ room, playerId, onSendMessage }: Props) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room.chatMessages])

  function handleSend() {
    const trimmed = message.trim()
    if (!trimmed) return
    onSendMessage(room.id, trimmed)
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className={styles.chat}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.onlineDot} />
        <span className={styles.headerLabel}>Chat</span>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {room.chatMessages.length === 0 ? (
          <p className={styles.empty}>No messages yet</p>
        ) : (
          room.chatMessages.map((m, i) => {
            const isYou = m.playerId === playerId
            return (
              <div key={i} className={styles.message}>
                <span
                  className={`${styles.messageName} ${isYou ? styles.isYou : ''}`}
                >
                  {isYou ? `${m.playerName} (You)` : m.playerName}
                </span>
                <span className={styles.messageText}>{m.text}</span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder='Say something...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          autoComplete='off'
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
