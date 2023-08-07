import { IRaceControlMessage, IRaceControlMessages } from '@renderer/types/LiveTimingStateTypes'
import { getHeadPadding } from '@renderer/utils/calculateFromRaceControlMessage'
import { useEffect, useState } from 'react'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoTitle from './TrackInfoTitle'
import TrackInfoBar from './TrackInfoBar'

interface IData {
  RaceControlMessages?: IRaceControlMessages
}

interface IHeadPadding {
  headPadding: string
  color: string
}

interface ITrackInfoHeadPaddingProps {
  data: IData
}

const TrackInfoHeadPadding = ({ data }: ITrackInfoHeadPaddingProps) => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [headPadding, setHeadPadding] = useState<IHeadPadding>({} as IHeadPadding)

  useEffect(() => {
    const { RaceControlMessages: dataRaceControlMessages } = data

    if (
      dataRaceControlMessages?.Messages &&
      JSON.stringify(dataRaceControlMessages.Messages) !== JSON.stringify(raceControlMessages)
    ) {
      setRaceControlMessages(dataRaceControlMessages.Messages)
      setHeadPadding(getHeadPadding(dataRaceControlMessages.Messages))
    }
  }, [data])

  return (
    <TrackInfoGroup>
      <TrackInfoTitle title={'PADDING'} />
      <TrackInfoBar text={headPadding.headPadding} color={headPadding.color} />
    </TrackInfoGroup>
  )
}

export default TrackInfoHeadPadding
