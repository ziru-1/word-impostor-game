import type { PlayerGameData, PublicGameRoom } from '@impostor/types'
import { useState } from 'react'
import styles from './GameScreen.module.css'

interface Props {
  playerId: string
  playerData: PlayerGameData
  room: PublicGameRoom
  onSubmitDescription: (roomId: string, text: string) => void
  onSubmitDecision: (roomId: string, choice: 'skip' | 'vote') => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

type Tab = 'current' | 'history'

const GameScreen = ({
  playerId,
  playerData,
  room,
  onSubmitDescription,
  onSubmitDecision,
}: Props) => {
  const [text, setText] = useState('')
  const [tab, setTab] = useState<Tab>('current')

  const currentPlayerTurnId = room.descriptionOrder[room.descriptions.length]
  const allPlayersDescribed = room.allDescriptions.length === room.roundNumber
  const currentDescriptions = allPlayersDescribed
    ? room.allDescriptions[room.roundNumber - 1]
    : room.descriptions

  const isMyTurn = playerId === currentPlayerTurnId
  const hasHistory =
    room.allDescriptions.slice(0, room.roundNumber - 1).length > 0
  const iHaveDecided = room.roundDecisions.some((d) => d.playerId === playerId)

  function handleSubmit() {
    if (!text.trim()) return
    onSubmitDescription(room.id, text.trim())
    setText('')
  }

  return (
    <div className={styles.page}>
      {/* Word card */}
      <div
        className={`${styles.wordCard} ${playerData.isImpostor ? styles.impostor : ''}`}
      >
        <div className={styles.wordCardLeft}>
          <span className={styles.wordLabel}>Your word</span>
          <span className={styles.wordValue}>{playerData.word}</span>
        </div>
        {playerData.isImpostor && (
          <span className={styles.roleBadge}>Impostor</span>
        )}
      </div>

      {/* Round + whose turn */}
      <div className={styles.meta}>
        <span className={styles.roundBadge}>Round {room.roundNumber}</span>
        {!allPlayersDescribed && (
          <span className={styles.turnIndicator}>
            {isMyTurn ? (
              <span className={`${styles.turnName} ${styles.isYou}`}>
                Your turn
              </span>
            ) : (
              <>
                <span className={styles.turnName}>
                  {room.players.find((p) => p.id === currentPlayerTurnId)?.name}
                </span>
                {' is describing'}
              </>
            )}
          </span>
        )}
        {allPlayersDescribed && (
          <span className={styles.turnIndicator}>All players described</span>
        )}
      </div>

      {/* Tabs — only show history tab if there are previous rounds */}
      {hasHistory && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'current' ? styles.active : ''}`}
            onClick={() => setTab('current')}
          >
            Round {room.roundNumber}
          </button>
          <button
            className={`${styles.tab} ${tab === 'history' ? styles.active : ''}`}
            onClick={() => setTab('history')}
          >
            History
          </button>
        </div>
      )}

      {/* Current round descriptions */}
      {tab === 'current' && (
        <div className={styles.panel}>
          {room.descriptionOrder.map((id) => {
            const player = room.players.find((p) => p.id === id)
            const description = currentDescriptions.find(
              (d) => d.playerId === id,
            )
            const isCurrentTurn =
              id === currentPlayerTurnId && !allPlayersDescribed
            const isYou = id === playerId

            return (
              <div
                key={id}
                className={[
                  styles.playerRow,
                  isCurrentTurn ? styles.isCurrentTurn : '',
                  isYou ? styles.isYou : '',
                ].join(' ')}
              >
                <div
                  className={[
                    styles.avatar,
                    isCurrentTurn ? styles.isCurrentTurn : '',
                    isYou ? styles.isYou : '',
                  ].join(' ')}
                >
                  {getInitials(player?.name ?? '?')}
                </div>
                <div className={styles.rowContent}>
                  <span
                    className={`${styles.rowName} ${isYou ? styles.isYou : ''}`}
                  >
                    {isYou ? `${player?.name} (You)` : player?.name}
                  </span>
                  {description ? (
                    <span className={styles.rowDescription}>
                      {description.text}
                    </span>
                  ) : isCurrentTurn ? (
                    <div className={styles.rowTyping}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <span className={styles.rowWaiting}>Waiting...</span>
                  )}
                  {allPlayersDescribed &&
                    room.roundDecisions.some((d) => d.playerId === id) && (
                      <span className={styles.votedBadge}>Decided</span>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className={styles.panel}>
          {room.allDescriptions
            .slice(0, room.roundNumber - 1)
            .map((roundDescriptions, index) => (
              <div key={index}>
                <p className={styles.roundHeader}>Round {index + 1}</p>
                {room.descriptionOrder.map((id) => {
                  const player = room.players.find((p) => p.id === id)
                  const description = roundDescriptions.find(
                    (d) => d.playerId === id,
                  )
                  const isYou = id === playerId

                  return (
                    <div
                      key={id}
                      className={`${styles.playerRow} ${isYou ? styles.isYou : ''}`}
                    >
                      <div
                        className={`${styles.avatar} ${isYou ? styles.isYou : ''}`}
                      >
                        {getInitials(player?.name ?? '?')}
                      </div>
                      <div className={styles.rowContent}>
                        <span
                          className={`${styles.rowName} ${isYou ? styles.isYou : ''}`}
                        >
                          {isYou ? 'You' : player?.name}
                        </span>
                        <span className={styles.rowDescription}>
                          {description?.text ?? 'No description'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      )}

      {/* Your turn input */}
      {isMyTurn && !allPlayersDescribed && (
        <div className={styles.inputArea}>
          <input
            className={styles.input}
            placeholder='Describe your word...'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            maxLength={120}
          />
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Submit
          </button>
        </div>
      )}

      {/* Vote / skip decision */}
      {allPlayersDescribed && (
        <div className={styles.decisionArea}>
          {iHaveDecided ? (
            <p className={styles.decisionLabel}>
              Waiting for others&nbsp;
              <span className={styles.decidedCount}>
                {room.roundDecisions.length} / {room.players.length}
              </span>
            </p>
          ) : (
            <>
              <p className={styles.decisionLabel}>What do you want to do?</p>
              <div className={styles.decisionBtns}>
                <button
                  className={styles.voteBtn}
                  onClick={() => onSubmitDecision(room.id, 'vote')}
                >
                  Vote
                </button>
                <button
                  className={styles.skipBtn}
                  onClick={() => onSubmitDecision(room.id, 'skip')}
                >
                  Skip round
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GameScreen
