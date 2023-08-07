import { IRaceControlMessage, IRaceControlMessages } from '@renderer/types/LiveTimingStateTypes'
import { getDrsStatus } from '@renderer/utils/calculateFromRaceControlMessage'
import { useEffect, useState } from 'react'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoTitle from './TrackInfoTitle'
import TrackInfoBar from './TrackInfoBar'
import Colors from '@renderer/modules/Colors'

interface IData {
  RaceControlMessages?: IRaceControlMessages
}

interface ITrackInfoDrsProps {
  data: IData
}

const TrackInfoDrs = ({ data }: ITrackInfoDrsProps) => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [drsStatus, setDrsStatus] = useState<boolean>(false)

  useEffect(() => {
    const { RaceControlMessages: dataRaceControlMessages } = data

    if (
      dataRaceControlMessages?.Messages &&
      JSON.stringify(dataRaceControlMessages.Messages) !== JSON.stringify(raceControlMessages)
    ) {
      setRaceControlMessages(dataRaceControlMessages.Messages)
      setDrsStatus(getDrsStatus(dataRaceControlMessages.Messages))
    }
  }, [data])

  return (
    <TrackInfoGroup>
      <TrackInfoTitle title={'DRS'} />
      <TrackInfoBar
        color={drsStatus ? Colors.green : Colors.red}
        text={drsStatus ? 'ENABLED' : 'DISABLED'}
      />
    </TrackInfoGroup>
  )
}

export default TrackInfoDrs
