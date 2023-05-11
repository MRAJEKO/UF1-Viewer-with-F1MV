import Colors from '@renderer/modules/Colors'

interface Props {
  title: string
  highlighted?: boolean
}

const CardTitleSessionLog = ({ title, highlighted }: Props) => {
  return (
    <p
      style={{
        backgroundColor: highlighted ? Colors.highlighted : 'var(--white)',
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
