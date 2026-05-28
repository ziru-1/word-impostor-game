import styles from './HowToPlayModal.module.css'

interface Props {
  onClose: () => void
}

const steps = [
  {
    title: 'Get your word',
    desc: 'Everyone receives the same secret word — except one player, the Impostor, who gets a different but similar word.',
  },
  {
    title: 'Describe your word',
    desc: 'Players take turns giving a one-sentence clue about their word. Be descriptive enough to prove you know it, but vague enough not to give it away.',
  },
  {
    title: 'Vote to proceed',
    desc: 'After everyone describes, the group votes to either start a new round of descriptions or move to elimination.',
  },
  {
    title: 'Eliminate a suspect',
    desc: 'When the group votes to eliminate, everyone picks who they think the Impostor is. The player with the most votes is out.',
  },
  {
    title: 'Find out the truth',
    desc: 'The Impostor wins if they survive the vote. The others win if they correctly eliminate the Impostor.',
  },
]

const tips = [
  {
    icon: '🕵️',
    text: "<strong>If you're the Impostor</strong> — listen carefully to others' clues before your turn. Try to blend in without giving away that your word is different.",
  },
  {
    icon: '👥',
    text: "<strong>If you're not the Impostor</strong> — watch for descriptions that feel off. The Impostor's word is close but not quite right.",
  },
]

const HowToPlayModal = ({ onClose }: Props) => {
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>How to Play</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNumber}>{i + 1}</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepDesc}>{step.desc}</span>
              </div>
            </div>
          ))}

          <div className={styles.divider} />

          {tips.map((tip, i) => (
            <div key={i} className={styles.tip}>
              <span className={styles.tipIcon}>{tip.icon}</span>
              <p
                className={styles.tipText}
                dangerouslySetInnerHTML={{ __html: tip.text }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HowToPlayModal
