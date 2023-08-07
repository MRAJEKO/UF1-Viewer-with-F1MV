import { getSessionStatus } from '@renderer/constants/SessionStatusMappings'
import Colors from '@renderer/modules/Colors'
import {
  ISessionStatusStatus,
  ISessionStatus,
  IRaceControlMessages
} from '@renderer/types/LiveTimingStateTypes'
import { checkStartDelayed } from '@renderer/utils/checkStartDelayed'
import { useEffect, useState } from 'react'
import TrackInfoBar from './TrackInfoBar'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoTitle from './TrackInfoTitle'

interface IData {
  SessionStatus?: ISessionStatus
  RaceControlMessages?: IRaceControlMessages
}

interface ITrackInfoSessionProps {
  sessionTime: string
  extraPolating: boolean
  data: IData
}

const TrackInfoSession = ({ sessionTime, extraPolating, data }: ITrackInfoSessionProps) => {
  const [sessionStatus, setSessionStatus] = useState<ISessionStatusStatus>('Aborted')

  const [startDelayed, setStartDelayed] = useState<boolean>(false)

  const { SessionStatus, RaceControlMessages } = data

  useEffect(() => {
    if (SessionStatus && SessionStatus.Status !== sessionStatus)
      setSessionStatus(SessionStatus.Status)

    if (checkStartDelayed(RaceControlMessages) !== startDelayed) setStartDelayed(!startDelayed)
  }, [SessionStatus, RaceControlMessages])

  const sessionStatusMappings = getSessionStatus(sessionStatus, startDelayed)

  return (
    <TrackInfoGroup>
      <TrackInfoTitle title={'SESSION'} />
      <TrackInfoBar
        textColor={sessionStatusMappings[2]}
        color={sessionStatusMappings[1]}
        text={sessionStatusMappings[0]}
      />
      <TrackInfoBar
        textColor={extraPolating ? null : Colors.black}
        color={extraPolating ? Colors.green : Colors.gray}
        text={sessionTime}
      />
    </TrackInfoGroup>
  )
}

export default TrackInfoSession
