import { useState } from 'react'
import styles from './LandingPage.module.css'

interface Props {
  onCreateRoom: (name: string) => void
  onJoinRoom: (name: string, roomId: string) => void
}

export default function LandingPage({ onCreateRoom, onJoinRoom }: Props) {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const trimmedName = name.trim()
  const trimmedCode = roomCode.trim()

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.eyebrow}>A social deduction word game</p>
        <h1 className={styles.title}>
          Word
          <br />
          <span className={styles.titleAccent}>Impostor</span>
        </h1>
        <p className={styles.tagline}>
          One player has a different word. Describe yours without giving it away
          — then find the liar.
        </p>
      </div>

      {/* Card */}
      <div className={styles.card}>
        {/* Name */}
        <div className={styles.nameRow}>
          <label className={styles.label} htmlFor='player-name'>
            Your name
          </label>
          <input
            id='player-name'
            className={styles.input}
            placeholder='Enter your name...'
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete='off'
            maxLength={24}
          />
        </div>

        {/* Create */}
        <button
          className={styles.primaryBtn}
          onClick={() => onCreateRoom(trimmedName)}
          disabled={!trimmedName}
        >
          Create Room
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or join existing</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Join */}
        <div className={styles.joinGroup}>
          <input
            className={styles.input}
            placeholder='Room code'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            autoComplete='off'
            maxLength={12}
          />
          <button
            className={styles.secondaryBtn}
            onClick={() => onJoinRoom(trimmedName, trimmedCode)}
            disabled={!trimmedName || !trimmedCode}
          >
            Join
          </button>
        </div>
      </div>

      <p className={styles.footer}>
        3 – 8 players &nbsp;·&nbsp; ~10 min per game
      </p>
    </div>
  )
}
