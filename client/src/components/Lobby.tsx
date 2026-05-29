import type { PublicGameRoom } from '@impostor/types'
import { useState } from 'react'
import styles from './Lobby.module.css'

interface Props {
  room: PublicGameRoom
  playerId: string
  onStartGame: (roomId: string) => void
  onToggleImpostorHint: (roomId: string) => void // <-- Added handler prop
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

const Lobby = ({
  room,
  playerId,
  onStartGame,
  onToggleImpostorHint,
}: Props) => {
  const [copied, setCopied] = useState(false)
  const isHost = playerId === room.hostId
  const canStart = room.players.length >= 3

  function handleCopy() {
    navigator.clipboard.writeText(room.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Room code */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Room code</p>
          <div className={styles.roomCodeRow}>
            <span className={styles.roomCode}>{room.id}</span>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>
            Players — {room.players.length} / 8
          </p>
          <ul className={styles.playerList}>
            {room.players.map((player, i) => {
              const isYou = player.id === playerId
              const isPlayerHost = player.id === room.hostId
              return (
                <li
                  key={player.id}
                  className={`${styles.playerRow} ${isYou ? styles.you : ''}`}
                  style={{ animationDelay: `${0.25 + i * 0.07}s` }}
                >
                  <div
                    className={`${styles.avatar} ${isPlayerHost ? styles.host : ''}`}
                  >
                    {getInitials(player.name)}
                  </div>
                  <span className={styles.playerName}>{player.name}</span>
                  {isPlayerHost && (
                    <span className={styles.hostBadge}>Host</span>
                  )}
                  {isYou && <span className={styles.youBadge}>You</span>}
                </li>
              )
            })}
          </ul>
        </div>

        {/* ─── Game Settings Option ────────────────────────────────────── */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsMeta}>
              <span className={styles.settingTitle}>Impostor Hint</span>
              <p className={styles.settingDesc}>
                Gives the Impostor a fake word related to the secret word.
              </p>
            </div>
            {isHost ? (
              <button
                type='button'
                className={`${styles.toggleSwitch} ${room.impostorHasHint ? styles.toggleOn : ''}`}
                onClick={() => onToggleImpostorHint(room.id)}
                aria-label='Toggle Impostor Hint'
              >
                <span className={styles.toggleKnob} />
              </button>
            ) : (
              <span
                className={`${styles.statusBadge} ${room.impostorHasHint ? styles.statusOn : styles.statusOff}`}
              >
                {room.impostorHasHint ? 'ON' : 'OFF'}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isHost ? (
            <>
              <button
                className={styles.startBtn}
                onClick={() => onStartGame(room.id)}
                disabled={!canStart}
              >
                Start Game
              </button>
              {!canStart && (
                <p className={styles.hint}>Need at least 3 players to start</p>
              )}
            </>
          ) : (
            <div className={styles.waiting}>
              Waiting for host
              <div className={styles.waitingDots}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lobby
