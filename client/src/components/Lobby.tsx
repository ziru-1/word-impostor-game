import type { PublicGameRoom } from '@impostor/types'
import { useState } from 'react'
import { DEFAULT_VOLUME, gameMusic } from '../audioManager'
import styles from './Lobby.module.css'

interface Props {
  room: PublicGameRoom
  playerId: string
  isStartingGame: boolean
  onStartGame: (roomId: string) => void
  onToggleImpostorHint: (roomId: string) => void
  onLeaveRoom: (roomId: string) => void
  onKickPlayer: (roomId: string, targetId: string) => void
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
  isStartingGame,
  onStartGame,
  onToggleImpostorHint,
  onLeaveRoom,
  onKickPlayer,
}: Props) => {
  const [copied, setCopied] = useState(false)

  const [isMuted, setIsMuted] = useState(false)

  const isHost = playerId === room.hostId
  const canStart = room.players.length >= 3

  function handleCopy() {
    navigator.clipboard.writeText(room.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleToggleMute() {
    if (isMuted) {
      gameMusic.volume(DEFAULT_VOLUME)
      setIsMuted(false)
    } else {
      gameMusic.volume(0)
      setIsMuted(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Room Header & Actions */}
        <div className={styles.header}>
          <div className={styles.topActionsRow}>
            <button
              type='button'
              className={styles.leaveBtn}
              onClick={() => onLeaveRoom(room.id)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className={styles.leaveIcon}
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
              Leave Room
            </button>

            <button
              type='button'
              className={styles.audioBtn}
              onClick={handleToggleMute}
            >
              {isMuted ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={styles.leaveIcon}
                  >
                    <path d='M11 5L6 9H2v6h4l5 4V5z' />
                    <line x1='23' y1='9' x2='17' y2='15' />
                    <line x1='17' y1='9' x2='23' y2='15' />
                  </svg>
                  Unmute
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={styles.leaveIcon}
                  >
                    <path d='M11 5L6 9H2v6h4l5 4V5z' />
                    <path d='M15.54 8.46a5 5 0 0 1 0 7.07' />
                  </svg>
                  Mute
                </>
              )}
            </button>
          </div>

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
              const showKickButton = isHost && !isPlayerHost

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

                  {showKickButton && (
                    <button
                      type='button'
                      className={styles.kickBtn}
                      onClick={() => onKickPlayer(room.id, player.id)}
                      title={`Kick ${player.name}`}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className={styles.kickIcon}
                      >
                        <line x1='18' y1='6' x2='6' y2='18' />
                        <line x1='6' y1='6' x2='18' y2='18' />
                      </svg>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Game Settings Option */}
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
                disabled={isStartingGame}
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
                disabled={!canStart || isStartingGame}
              >
                {isStartingGame ? 'Starting Game...' : 'Start Game'}
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
      <p className={styles.musicCredit}>
        Track by:{' '}
        <a
          href='https://www.youtube.com/@inu.neko.bgm.2025'
          target='_blank'
          rel='noreferrer'
        >
          inu.neko.bgm.2025
        </a>
      </p>
    </div>
  )
}

export default Lobby
