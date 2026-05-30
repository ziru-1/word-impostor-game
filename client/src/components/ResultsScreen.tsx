import type { GameReveal, PublicGameRoom } from '@impostor/types'
import { useEffect, useRef, useState } from 'react'
import styles from './ResultsScreen.module.css'

interface Props {
  room: PublicGameRoom
  playerId: string
  reveal: GameReveal
  onPlayAgain: (roomId: string) => void
}

type Tab = 'votes' | 'descriptions'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

function isTiedResult(room: PublicGameRoom, votedOutId: string | null) {
  if (!votedOutId) return false
  const counts: Record<string, number> = {}
  for (const v of room.votes) {
    counts[v.targetId] = (counts[v.targetId] ?? 0) + 1
  }
  if (Object.keys(counts).length === 0) return false
  const max = Math.max(...Object.values(counts))
  return Object.values(counts).filter((c) => c === max).length > 1
}

const FLICKER_NAMES = [
  'Alex',
  'Jordan',
  'Sam',
  'Morgan',
  'Riley',
  'Chris',
  'Taylor',
  'Drew',
]
const FLICKER_MS = 3000
const SETTLE_MS = 900

const ResultsScreen = ({ room, playerId, reveal, onPlayAgain }: Props) => {
  const [tab, setTab] = useState<Tab>('votes')

  const isPrematureEnd = !room.votedOutPlayerId && room.votes.length === 0

  const votedOutPlayer = room.players.find(
    (p) => p.id === room.votedOutPlayerId,
  )
  const impostor = room.players.find((p) => p.id === reveal.impostorId)

  // Safe calculation: Impostor only loses if explicitly voted out
  const impostorCaught = room.votedOutPlayerId === reveal.impostorId
  const isTie = isTiedResult(room, room.votedOutPlayerId)
  const playerHasPlayedAgain = room.playAgainPlayerIds.includes(playerId)

  type FlickerPhase = 'flickering' | 'settling' | 'done'
  const [flickerPhase, setFlickerPhase] = useState<FlickerPhase>(
    isTie ? 'flickering' : 'done',
  )
  const [flickerName, setFlickerName] = useState<string>(FLICKER_NAMES[0])
  const [tieRevealed, setTieRevealed] = useState(false)
  const [panelAnimated, setPanelAnimated] = useState(false)
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isTie) return

    let i = 0
    flickerRef.current = setInterval(() => {
      setFlickerName(FLICKER_NAMES[i % FLICKER_NAMES.length])
      i++
    }, 110)

    const settleTimer = setTimeout(() => {
      if (flickerRef.current) clearInterval(flickerRef.current)
      setFlickerPhase('settling')
      setFlickerName(votedOutPlayer?.name ?? '')

      setTimeout(() => {
        setFlickerPhase('done')
        setTieRevealed(true)
      }, SETTLE_MS)
    }, FLICKER_MS)

    return () => {
      if (flickerRef.current) clearInterval(flickerRef.current)
      clearTimeout(settleTimer)
    }
  }, [isTie, votedOutPlayer?.name])

  const isAnimating = flickerPhase !== 'done'
  const votedOutDisplayName = isAnimating
    ? flickerName
    : (votedOutPlayer?.name ?? '—')

  function tieClass() {
    if (!isTie) return ''
    if (isAnimating) return styles.hidden
    if (tieRevealed) return styles.animateIn
    return ''
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        {isTie && isAnimating ? (
          <div className={styles.tieBanner}>
            <span className={styles.tieBannerIcon}>⚡</span>
            <span className={styles.tieBannerText}>Tiebreaker</span>
            <span className={styles.tieBannerSub}>Selecting randomly...</span>
          </div>
        ) : (
          <>
            <p className={styles.resultLabel}>
              {isPrematureEnd
                ? 'Match Aborted'
                : isTie
                  ? 'Tie — random elimination'
                  : 'Result'}
            </p>
            <p
              className={`${styles.resultText} ${
                isPrematureEnd
                  ? styles.impostorWins
                  : impostorCaught
                    ? styles.impostorLoses
                    : styles.impostorWins
              }`}
            >
              {isPrematureEnd
                ? 'Lobby Disconnected'
                : impostorCaught
                  ? 'Impostor Caught'
                  : 'Impostor Wins'}
            </p>
          </>
        )}
      </div>

      {/* Reveal cards */}
      <div className={styles.revealRow}>
        {/* Voted out card — hidden if game ended prematurely without voting */}
        {!isPrematureEnd && (
          <div
            className={`${styles.revealCard} ${!isAnimating ? (impostorCaught ? styles.match : styles.mismatch) : ''}`}
          >
            <span className={styles.revealCardLabel}>Voted out</span>
            <span
              className={[
                styles.revealCardName,
                flickerPhase === 'flickering' ? styles.flickering : '',
                flickerPhase === 'settling' ? styles.settling : '',
              ].join(' ')}
            >
              {votedOutDisplayName}
            </span>
            {!isAnimating && (
              <span
                className={`${styles.revealCardSub} ${impostorCaught ? styles.correct : styles.wrong}`}
              >
                {impostorCaught ? 'Was the impostor' : 'Not the impostor'}
              </span>
            )}
          </div>
        )}

        {/* Impostor card */}
        <div className={`${styles.revealCard} ${tieClass()}`}>
          <span className={`${styles.revealCardLabel} ${styles.impostorLabel}`}>
            Impostor was
          </span>
          {/* Priority: Active player list name -> Reveal payload name -> Generic Fallback */}
          <span className={styles.revealCardName}>
            {impostor?.name ?? reveal.impostorName ?? 'Disconnected Player'}
          </span>
          <span
            className={styles.revealCardSub}
            style={{ color: 'var(--c-text-dim)' }}
          >
            Word: {reveal.impostorHasHint ? reveal.fakeWord : '---'}
          </span>
        </div>
      </div>

      {/* Words */}
      <div className={`${styles.wordsRow} ${tieClass()}`}>
        <div className={styles.wordChip}>
          <span className={styles.wordChipLabel}>Shared word</span>
          <span className={styles.wordChipValue}>{reveal.sharedWord}</span>
        </div>
        <div className={styles.wordChip}>
          <span className={styles.wordChipLabel}>Fake word</span>
          <span className={`${styles.wordChipValue} ${styles.fake}`}>
            {reveal.impostorHasHint ? reveal.fakeWord : '---'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${styles.tabs} ${tieClass()}`}>
        <button
          className={`${styles.tab} ${tab === 'votes' ? styles.active : ''}`}
          onClick={() => setTab('votes')}
        >
          Votes
        </button>
        <button
          className={`${styles.tab} ${tab === 'descriptions' ? styles.active : ''}`}
          onClick={() => setTab('descriptions')}
        >
          Descriptions
        </button>
      </div>

      {/* Votes panel */}
      <div
        className={`${styles.panel} ${!panelAnimated ? styles.animateIn : ''} ${tab !== 'votes' || (isTie && isAnimating) ? styles.hidden : ''}`}
        onAnimationEnd={() => setPanelAnimated(true)}
      >
        {room.votes.length === 0 ? (
          <p
            className={styles.emptyNotice}
            style={{
              textAlign: 'center',
              color: 'var(--c-text-dim)',
              fontSize: '13px',
              marginTop: '2rem',
            }}
          >
            No votes were cast this match.
          </p>
        ) : (
          room.votes.map((vote) => {
            const voter = room.players.find((p) => p.id === vote.voterId)
            const target = room.players.find((p) => p.id === vote.targetId)
            const voterIsYou = vote.voterId === playerId
            const targetWasImpostor = vote.targetId === reveal.impostorId

            return (
              <div key={vote.voterId} className={styles.voteRow}>
                <div
                  className={`${styles.voteChip} ${voterIsYou ? styles.isYou : ''}`}
                >
                  <div
                    className={`${styles.voteAvatar} ${voterIsYou ? styles.isYou : ''}`}
                  >
                    {getInitials(voter?.name ?? '?')}
                  </div>
                  <span
                    className={`${styles.voteChipName} ${voterIsYou ? styles.isYou : ''}`}
                  >
                    {voterIsYou
                      ? `${voter?.name ?? 'Left'} (You)`
                      : (voter?.name ?? 'Left')}
                  </span>
                </div>
                <span className={styles.voteArrow}>→</span>
                <div
                  className={`${styles.voteChip} ${targetWasImpostor ? styles.isImpostor : ''}`}
                >
                  <div
                    className={`${styles.voteAvatar} ${targetWasImpostor ? styles.isImpostor : ''}`}
                  >
                    {getInitials(target?.name ?? '?')}
                  </div>
                  <span
                    className={`${styles.voteChipName} ${targetWasImpostor ? styles.isImpostor : ''}`}
                  >
                    {target?.name ?? 'Left'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Descriptions panel */}
      <div
        className={`${styles.panel} ${!panelAnimated ? styles.animateIn : ''} ${tab !== 'descriptions' || (isTie && isAnimating) ? styles.hidden : ''}`}
      >
        {room.allDescriptions.length === 0 ? (
          <p
            className={styles.emptyNotice}
            style={{
              textAlign: 'center',
              color: 'var(--c-text-dim)',
              fontSize: '13px',
              marginTop: '2rem',
            }}
          >
            No descriptions were submitted.
          </p>
        ) : (
          room.allDescriptions.map((roundDescriptions, index) => (
            <div key={index}>
              <p className={styles.roundHeader}>Round {index + 1}</p>
              {room.descriptionOrder.map((id) => {
                const player = room.players.find((p) => p.id === id)
                const description = roundDescriptions.find(
                  (d) => d.playerId === id,
                )
                const isYou = id === playerId
                const isImpostor = id === reveal.impostorId

                // Render logs cleanly even if a player left mid-round
                return (
                  <div key={id} className={styles.descRow}>
                    <div className={styles.descAvatar}>
                      {getInitials(player?.name ?? '??')}
                    </div>
                    <div className={styles.descContent}>
                      <span
                        className={[
                          styles.descName,
                          isYou ? styles.isYou : '',
                          isImpostor ? styles.isImpostor : '',
                        ].join(' ')}
                      >
                        {isYou
                          ? `${player?.name ?? 'Left'} (You)`
                          : (player?.name ?? 'Left')}
                        {isImpostor ? ' (impostor)' : ''}
                      </span>
                      <span className={styles.descText}>
                        {description?.text ?? 'No description'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Play again container */}
      <div className={styles.footerContainer}>
        <div className={styles.readyPlayersList}>
          {room.players.map((player) => {
            const isReady = room.playAgainPlayerIds.includes(player.id)
            const isYou = player.id === playerId
            return (
              <div
                key={player.id}
                className={`${styles.readyPlayerBadge} ${isReady ? styles.ready : ''} ${isYou ? styles.isYou : ''}`}
              >
                <span className={styles.readyIndicator}>
                  {isReady ? '✓' : '•••'}
                </span>
                <span className={styles.readyPlayerName}>
                  {isYou ? `${player.name} (You)` : player.name}
                </span>
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.playAgainBtn}
            onClick={() => onPlayAgain(room.id)}
            disabled={playerHasPlayedAgain}
          >
            {playerHasPlayedAgain ? 'Waiting for others...' : 'Play Again'}
          </button>
          <span className={styles.playAgainCount}>
            {room.playAgainPlayerIds.length} / {room.players.length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ResultsScreen
