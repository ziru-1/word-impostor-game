import { useState } from 'react'
import HowToPlayModal from './HowToPlayModal'
import styles from './LandingPage.module.css'

interface Props {
  onCreateRoom: (name: string) => void
  onJoinRoom: (name: string, roomId: string) => void
  isPending: boolean
}

export default function LandingPage({
  onCreateRoom,
  onJoinRoom,
  isPending,
}: Props) {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const [loadingAction, setLoadingAction] = useState<'create' | 'join' | null>(
    null,
  )

  const trimmedName = name.trim()
  const trimmedCode = roomCode.trim()

  // Reset tracking if App.tsx signals that we are no longer loading
  if (!isPending && loadingAction !== null) {
    setLoadingAction(null)
  }

  const handleCreate = () => {
    if (!trimmedName || isPending) return
    setLoadingAction('create')
    onCreateRoom(trimmedName)
  }

  const handleJoin = () => {
    if (!trimmedName || !trimmedCode || isPending) return
    setLoadingAction('join')
    onJoinRoom(trimmedName, trimmedCode)
  }

  return (
    <>
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      <div className={styles.page}>
        <div className={styles.inner}>
          {/* Hero */}
          <div className={styles.hero}>
            <p className={styles.eyebrow}>A social deduction word game</p>
            <h1 className={styles.title}>
              Word
              <br />
              <span className={styles.titleAccent}>Impostor</span>
            </h1>
            <p className={styles.tagline}>
              One player has a different word. Describe yours without giving it
              away — then find the liar.
            </p>
            <button
              className={styles.howToPlayBtn}
              onClick={() => setShowHowToPlay(true)}
              disabled={isPending}
            >
              <span className={styles.howToPlayIcon}>?</span>
              How to play
            </button>
          </div>

          {/* Card */}
          <div className={styles.card}>
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
                disabled={isPending}
              />
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleCreate}
              disabled={!trimmedName || isPending}
            >
              {isPending && loadingAction === 'create'
                ? 'Creating Room...'
                : 'Create Room'}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>or join existing</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.joinGroup}>
              <input
                className={styles.input}
                placeholder='Room code'
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                autoComplete='off'
                maxLength={12}
                disabled={isPending}
              />
              <button
                className={styles.secondaryBtn}
                onClick={handleJoin}
                disabled={!trimmedName || !trimmedCode || isPending}
              >
                {isPending && loadingAction === 'join' ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>

          <p className={styles.footer}>
            3 – 8 players &nbsp;·&nbsp; ~10 min per game
          </p>
        </div>
      </div>
    </>
  )
}
