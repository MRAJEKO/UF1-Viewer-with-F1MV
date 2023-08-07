import { IRaceControlMessage, IRaceControlMessages } from '@renderer/types/LiveTimingStateTypes'
import { getLowGrip } from '@renderer/utils/calculateFromRaceControlMessage'
import { useState, useEffect } from 'react'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoTitle from './TrackInfoTitle'
import Colors from '@renderer/modules/Colors'
import TrackInfoBar from './TrackInfoBar'

interface IData {
  RaceControlMessages?: IRaceControlMessages
}

interface ITrackInfoGripProps {
  data: IData
}

const TrackInfoGrip = ({ data }: ITrackInfoGripProps) => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [lowGrip, setLowGrip] = useState<boolean>(false)

  useEffect(() => {
    const { RaceControlMessages: dataRaceControlMessages } = data

    if (
      dataRaceControlMessages?.Messages &&
      JSON.stringify(dataRaceControlMessages.Messages) !== JSON.stringify(raceControlMessages)
    ) {
      setRaceControlMessages(dataRaceControlMessages.Messages)
      setLowGrip(getLowGrip(dataRaceControlMessages.Messages))
    }
  }, [data])

  return (
    <TrackInfoGroup>
      <TrackInfoTitle title="GRIP" />
      <TrackInfoBar
        color={lowGrip ? Colors.orange : Colors.green}
        text={lowGrip ? 'LOW' : 'NORMAL'}
      />
    </TrackInfoGroup>
  )
}

export default TrackInfoGrip
