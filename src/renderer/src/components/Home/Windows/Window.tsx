import styles from './Windows.module.css'

import Colors from '../../../assets/Colors.module.css'

interface Props {
  onPress: () => void
  name: string
  type?: string
}

const Window = ({ onPress, name, type = 'default' }: Props) => {
  return (
    <button className={`${styles.window} ${Colors[`${type}-button`]}`} onClick={onPress}>
      {name}
    </button>
  )
}

export default Window
