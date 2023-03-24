import styles from './Windows.module.css'

interface Props {
  onPress: () => void
  name: string
  type?: string
}

const Window = ({ onPress, name, type = 'default' }: Props) => {
  return (
    <button className={`${styles.window} ${styles[`${type}-button`]}`} onClick={onPress}>
      {name}
    </button>
  )
}

export default Window
