import MoveMode from '@renderer/components/MoveMode'
import styles from '@renderer/components/SingleRCM/SingleRCM.module.scss'
import fia from '@renderer/assets/icons/fia.png'
import {
  IDriverList,
  IRaceControlMessage,
  IRaceControlMessages,
  ISessionInfo
} from '@renderer/types/LiveTimingStateTypes'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { speed4 } from '@renderer/constants/refreshIntervals'
import { useEffect, useState } from 'react'
import { singlercmSettings } from '@renderer/modules/Settings'
import { modifyRaceControlMessageText } from '@renderer/components/SingleRCM/modifyRaceControlMessageText'
import { isWantedSingleRaceControlMessage } from '@renderer/utils/isWantedMessage'

interface IData {
  RaceControlMessages?: IRaceControlMessages
  SessionInfo?: ISessionInfo
  DriverList?: IDriverList
}

const SingleRCM = () => {
  const [sessionInfo, setSessionInfo] = useState<ISessionInfo | null>(null)
  const [driverList, setDriverList] = useState<IDriverList | null>(null)
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [queue, setQueue] = useState<IRaceControlMessage[]>([])
  const [message, setMessage] = useState<IRaceControlMessage | null>(null)
  const [style, setStyle] = useState({} as React.CSSProperties)
  const [displaying, setDisplaying] = useState(false)

  const keepOnDisplay = singlercmSettings?.settings?.keep_on_display?.value ?? false
  const displayDuration = singlercmSettings?.settings?.display_duration?.value ?? 10000

  const handleDataReceived = (data: IData, firstPatch: boolean) => {
    const {
      RaceControlMessages: dataRaceControlMessages,
      SessionInfo: dataSessionInfo,
      DriverList: dataDriverList
    } = data

    if (JSON.stringify(sessionInfo) !== JSON.stringify(dataSessionInfo)) {
      setSessionInfo(dataSessionInfo || null)
      setQueue([])
    }

    if (JSON.stringify(driverList) !== JSON.stringify(dataDriverList))
      setDriverList(dataDriverList || null)

    const oldLength = raceControlMessages.length

    const newLength = dataRaceControlMessages?.Messages?.length ?? 0
    if (
      !firstPatch &&
      JSON.stringify(sessionInfo) === JSON.stringify(dataSessionInfo) &&
      oldLength < newLength
    ) {
      const newMessages =
        dataRaceControlMessages?.Messages?.slice(oldLength).filter((message) =>
          isWantedSingleRaceControlMessage(message)
        ) || []

      setQueue([...queue, ...newMessages])
    } else if (oldLength > newLength) {
      setQueue([])
    }

    setRaceControlMessages(dataRaceControlMessages?.Messages || [])
  }

  console.log(queue)

  useEffect(() => {
    if (queue.length > 0 && !displaying) {
      setDisplaying(true)
      if (keepOnDisplay) {
        setStyle({ animation: `${styles.hide} 2.5s ease-in-out 0s 1 normal forwards` })
        setTimeout(() => {
          setMessage(queue[0])
          setStyle({ animation: `${styles.display} 2.5s ease-in-out 0s 1 normal forwards` })
          setTimeout(() => {
            setDisplaying(false)
            setQueue((prevQueue) => prevQueue.slice(1))
          }, displayDuration)
        }, 3500)
      } else {
        setMessage(queue[0])
        setStyle({ animation: `${styles.display} 2.5s ease-in-out 0s 1 normal forwards` })
        setTimeout(() => {
          setStyle({ animation: `${styles.hide} 2.5s ease-in-out 0s 1 normal forwards` })
          setTimeout(() => {
            setDisplaying(false)
            setQueue((prevQueue) => prevQueue.slice(1))
          }, 3500)
        }, displayDuration)
      }
    }
  }, [queue, displaying])

  LiveTiming(['RaceControlMessages', 'SessionInfo', 'DriverList'], handleDataReceived, speed4)

  return (
    <>
      <MoveMode horizontal={true} />
      <div className={styles.container}>
        <div
          className={`${styles.message} ${keepOnDisplay ? '' : styles['hide-initially']}`}
          style={style}
        >
          <div className={styles.fia}>
            <img src={fia} alt="" />
          </div>
          <div className={styles.text}>
            <p
              dangerouslySetInnerHTML={{
                __html: modifyRaceControlMessageText(
                  message?.Message ?? 'SINGLE RACE CONTROL MESSAGE',
                  driverList
                )
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default SingleRCM
