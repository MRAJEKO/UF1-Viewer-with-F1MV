import styles from './TeamRadios.module.scss'

interface IProps {
  name: string
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const StatusButton = ({ name, enabled, setEnabled }: IProps) => {
  return (
    <div
      className={`${styles['status-button']} ${enabled ? styles.connected : styles.disconnected}`}
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
