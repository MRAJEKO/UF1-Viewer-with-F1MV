import styles from '../components/SessionLog/SessionLog.module.css'
import { sessionLog } from '../modules/Settings'
import WindowHeader from '@renderer/components/WindowHeader'
import MoveMode from '@renderer/components/MoveMode'
import { useCallback, useState } from 'react'
import { IRaceControlMessage } from '@renderer/types/RaceControlMessages'
import { ILiveTimingData } from '@renderer/types/LiveTimingData'
import LiveTiming from '@renderer/hooks/useLiveTiming'

const SessionLog = () => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[] | null>(null)

  const handleDataReceived = useCallback(
    (data: ILiveTimingData) => {
      console.log(data)
      const dataRaceControlMessages = data?.RaceControlMessages?.Messages

      console.log(JSON.stringify(dataRaceControlMessages) !== JSON.stringify(raceControlMessages))

      if (
        dataRaceControlMessages &&
        JSON.stringify(dataRaceControlMessages) !== JSON.stringify(raceControlMessages)
      )
        setRaceControlMessages(dataRaceControlMessages)
    },
    [raceControlMessages]
  )

  LiveTiming(['RaceControlMessages', 'TimingData'], handleDataReceived, 500)

  console.log(raceControlMessages)

  return (
    <div className={styles.wrapper}>
      <MoveMode />
      {sessionLog?.settings?.show_header?.value && <WindowHeader title="Session Log" />}
    </div>
  )
}

export default SessionLog
