import { useState, useEffect } from 'react'
import HowToPlayModal from './HowToPlayModal'
import styles from './LandingPage.module.css'

interface Props {
  initialName: string
  onCreateRoom: (name: string) => void
  onJoinRoom: (name: string, roomId: string) => void
  isPending: boolean
}

type Tab = 'create' | 'join'

export default function LandingPage({
  initialName,
  onCreateRoom,
  onJoinRoom,
  isPending,
}: Props) {
  const [name, setName] = useState(initialName)
  const [roomCode, setRoomCode] = useState('')
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('join')
  const [loadingAction, setLoadingAction] = useState<Tab | null>(null)

  const trimmedName = name.trim()
  const trimmedCode = roomCode.trim()

  // Safely synchronize button animations when the parent unsets loading states
  useEffect(() => {
    if (!isPending) {
      setLoadingAction(null)
    }
  }, [isPending])

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
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'join' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('join')}
                disabled={isPending}
              >
                Join room
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'create' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('create')}
                disabled={isPending}
              >
                Create room
              </button>
            </div>

            {/* Create panel — always mounted, hidden when inactive */}
            <div
              className={`${styles.panel} ${activeTab !== 'create' ? styles.panelHidden : ''}`}
            >
              <div className={styles.nameRow}>
                <label className={styles.label} htmlFor='player-name-create'>
                  Your name
                </label>
                <input
                  id='player-name-create'
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
            </div>

            {/* Join panel — always mounted, hidden when inactive */}
            <div
              className={`${styles.panel} ${activeTab !== 'join' ? styles.panelHidden : ''}`}
            >
              <div className={styles.nameRow}>
                <label className={styles.label} htmlFor='room-code'>
                  Room code
                </label>
                <input
                  id='room-code'
                  className={`${styles.input} ${styles.inputCode}`}
                  placeholder='ABCDE'
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  autoComplete='off'
                  maxLength={5}
                  disabled={isPending}
                />
              </div>
              <div className={styles.nameRow}>
                <label className={styles.label} htmlFor='player-name-join'>
                  Your name
                </label>
                <input
                  id='player-name-join'
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
                onClick={handleJoin}
                disabled={!trimmedName || !trimmedCode || isPending}
              >
                {isPending && loadingAction === 'join'
                  ? 'Joining...'
                  : 'Join Room'}
              </button>
            </div>
          </div>

          <p className={styles.footer}>
            3 – 8 players &nbsp;·&nbsp; ~5 min per game
          </p>
        </div>
      </div>
    </>
  )
}
