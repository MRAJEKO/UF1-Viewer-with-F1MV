import {
  IRaceControlMessage,
  IRaceControlMessages,
  ISessionStatus,
  ISessionStatusStatus
} from '@renderer/types/LiveTimingStateTypes'
import { useEffect, useState } from 'react'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoBar from './TrackInfoBar'
import {
  getPitEntryStatus,
  getPitExitStatus
} from '@renderer/utils/calculateFromRaceControlMessage'
import Colors from '@renderer/modules/Colors'
import TrackInfoTitle from './TrackInfoTitle'

interface IData {
  RaceControlMessages?: IRaceControlMessages
  SessionStatus?: ISessionStatus
}

interface ITrackInfoPitlaneProps {
  data: IData
}

const TrackInfoPitlane = ({ data }: ITrackInfoPitlaneProps) => {
  const [sessionStatus, setSessionStatus] = useState<ISessionStatusStatus | null>(null)
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [pitEntry, setPitEntry] = useState<boolean>(true)
  const [pitExit, setPitExit] = useState<boolean>(false)

  useEffect(() => {
    const { SessionStatus: dataSessionStatus, RaceControlMessages: dataRaceControlMessages } = data

    if (dataSessionStatus?.Status !== sessionStatus)
      return setSessionStatus(dataSessionStatus?.Status ?? null)

    if (
      dataRaceControlMessages?.Messages &&
      JSON.stringify(dataRaceControlMessages.Messages) !== JSON.stringify(raceControlMessages)
    ) {
      setRaceControlMessages(dataRaceControlMessages.Messages)
      setPitEntry(getPitEntryStatus(dataRaceControlMessages.Messages))
      setPitExit(getPitExitStatus(dataRaceControlMessages.Messages, sessionStatus))
    }
  }, [data])

  return (
    <TrackInfoGroup>
      <TrackInfoTitle title={'PITLANE'} />
      <TrackInfoBar color={pitEntry ? Colors.green : Colors.red} text="ENTRY"></TrackInfoBar>
      <TrackInfoBar color={pitExit ? Colors.green : Colors.red} text="EXIT"></TrackInfoBar>
    </TrackInfoGroup>
  )
}

export default TrackInfoPitlane
