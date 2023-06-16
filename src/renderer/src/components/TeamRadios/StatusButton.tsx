import styles from './TeamRadios.module.css'

interface IProps {
  name: string
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const StatusButton = ({ name, enabled, setEnabled }: IProps) => {
  return (
    <div
      className={styles['status-button']}
      style={{ color: enabled ? 'var(--connected)' : 'var(--disconnected)' }}
      onClick={() => {
        console.log(enabled)
        setEnabled(!enabled)
      }}
    >
      {name}
    </div>
  )
}

export default StatusButton
