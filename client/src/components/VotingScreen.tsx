import type { PublicGameRoom } from '@impostor/types'
import { useState } from 'react'
import styles from './VotingScreen.module.css'

interface Props {
  playerId: string
  room: PublicGameRoom
  onCastVote: (roomId: string, targetId: string) => void
}

type Tab = 'vote' | 'descriptions'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

const VotingScreen = ({ playerId, room, onCastVote }: Props) => {
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('vote')

  const playerHasVoted = room.votes.some((v) => v.voterId === playerId)
  const votescast = room.votes.length

  function handleConfirm() {
    if (!selected) return
    onCastVote(room.id, selected)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          Who's the <span className={styles.impostor}>impostor</span>?
        </h2>
        <p className={styles.subtitle}>Vote to eliminate a suspect</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'vote' ? styles.active : ''}`}
          onClick={() => setTab('vote')}
        >
          Vote
        </button>
        <button
          className={`${styles.tab} ${tab === 'descriptions' ? styles.active : ''}`}
          onClick={() => setTab('descriptions')}
        >
          Descriptions
        </button>
      </div>

      {/* Vote tab */}
      <div className={`${styles.panel} ${tab !== 'vote' ? styles.hidden : ''}`}>
        {room.descriptionOrder.map((id) => {
          const player = room.players.find((p) => p.id === id)
          const isSelf = id === playerId
          const hasVoted = room.votes.some((v) => v.voterId === id)
          const isSelected = selected === id

          return (
            <div
              key={id}
              className={[
                styles.playerRow,
                isSelected ? styles.selected : '',
                isSelf ? styles.isSelf : '',
                playerHasVoted ? styles.hasVoted : '',
              ].join(' ')}
              onClick={() => {
                if (isSelf || playerHasVoted) return
                setSelected(isSelected ? null : id)
              }}
            >
              <div
                className={`${styles.avatar} ${isSelf ? styles.isSelf : ''}`}
              >
                {getInitials(player?.name ?? '?')}
              </div>
              <div className={styles.playerInfo}>
                <span
                  className={`${styles.playerName} ${isSelf ? styles.isSelf : ''}`}
                >
                  {player?.name}
                </span>
                {isSelf && (
                  <span className={`${styles.playerMeta} ${styles.isSelf}`}>
                    You
                  </span>
                )}
                {!isSelf && hasVoted && (
                  <span className={`${styles.playerMeta} ${styles.voted}`}>
                    Voted
                  </span>
                )}
              </div>
              {!isSelf && !playerHasVoted && (
                <div className={styles.selectIndicator} />
              )}
            </div>
          )
        })}
      </div>

      {/* Descriptions tab */}
      <div
        className={`${styles.panel} ${tab !== 'descriptions' ? styles.hidden : ''}`}
      >
        {room.allDescriptions.map((roundDescriptions, index) => (
          <div key={index}>
            <p className={styles.roundHeader}>Round {index + 1}</p>
            {room.descriptionOrder.map((id) => {
              const player = room.players.find((p) => p.id === id)
              const description = roundDescriptions.find(
                (d) => d.playerId === id,
              )
              const isYou = id === playerId

              return (
                <div key={id} className={styles.descRow}>
                  <div className={styles.descAvatar}>
                    {getInitials(player?.name ?? '?')}
                  </div>
                  <div className={styles.descContent}>
                    <span
                      className={`${styles.descName} ${isYou ? styles.isYou : ''}`}
                    >
                      {isYou ? 'You' : player?.name}
                    </span>
                    <span className={styles.descText}>
                      {description?.text ?? 'No description'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Confirm / waiting */}
      {tab === 'vote' &&
        (playerHasVoted ? (
          <div className={styles.waiting}>
            Waiting for others&nbsp;
            <span className={styles.waitingCount}>
              {votescast} / {room.players.length}
            </span>
            <div className={styles.waitingDots}>
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className={styles.confirmArea}>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={!selected}
            >
              {selected
                ? `Vote for ${room.players.find((p) => p.id === selected)?.name}`
                : 'Select a suspect'}
            </button>
          </div>
        ))}
    </div>
  )
}

export default VotingScreen
