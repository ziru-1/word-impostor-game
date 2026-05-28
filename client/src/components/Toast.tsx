import styles from './Toast.module.css'

interface Props {
  errorMessage: string | null
}

const Toast = ({ errorMessage }: Props) => {
  if (!errorMessage) return null
  return <div className={styles.toast}>{errorMessage}</div>
}

export default Toast
