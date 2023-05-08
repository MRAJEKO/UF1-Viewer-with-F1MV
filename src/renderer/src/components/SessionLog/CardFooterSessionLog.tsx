interface Props {
  time: string
  lap?: number
}

const CardFooterSessionLog = ({ time, lap }: Props) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--black)',
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        placeItems: 'center',
        padding: '3vw 0',
        fontSize: '5vw',
        fontFamily: 'InterMedium',
        borderTop: '0.5vw solid var(--white)'
      }}
    >
      <p>{time}</p>
      <p>Lap {lap}</p>
    </div>
  )
}

export default CardFooterSessionLog
