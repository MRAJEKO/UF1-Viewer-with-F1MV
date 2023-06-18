import Colors from '@renderer/modules/Colors'
import styles from './SessionLog.module.scss'

interface Props {
  title: string
  highlighted?: boolean
}

const CardTitleSessionLog = ({ title, highlighted }: Props) => {
  return (
    <p
      className={styles['card-title']}
      style={{
        backgroundColor: highlighted ? Colors.highlighted : '',
        fontFamily: 'InterBold',
        fontSize: '5vw',
        textAlign: 'center',
        padding: '3vw 0'
      }}
    >
      {title}
    </p>
  )
}

export default CardTitleSessionLog
