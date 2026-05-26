interface Props {
  errorMessage: string | null
}

const Toast = ({ errorMessage }: Props) => {
  if (!errorMessage) return null
  return <div style={{ background: 'red' }}>{errorMessage}</div>
}

export default Toast
