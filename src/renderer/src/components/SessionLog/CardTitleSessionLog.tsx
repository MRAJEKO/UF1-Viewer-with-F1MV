interface Props {
  title: string
}

const CardTitleSessionLog = ({ title }: Props) => {
  return (
    <p
      style={{
        backgroundColor: 'white',
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
