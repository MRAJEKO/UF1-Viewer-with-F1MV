interface Props {
  time: string
  lap?: number
  qualifyingPart?: number
}

const CardFooterSessionLog = ({ time, lap, qualifyingPart }: Props) => {
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
      {(lap && <p>Lap {lap}</p>) || (qualifyingPart && <p>{qualifyingPart}</p>)}
    </div>
  )
}

export default CardFooterSessionLog
