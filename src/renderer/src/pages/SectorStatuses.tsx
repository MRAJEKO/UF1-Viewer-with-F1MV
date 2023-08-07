const { getCircuitInfo } = window.mvApi

import styles from '@renderer/components/SectorStatuses/SectorStatuses.module.scss'
import {
  SectorStatusColors,
  SectorStatusText,
  TrackStatusColors,
  TrackStatusText
} from '@renderer/constants/SectorStatusesMappings'
import { speed4 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import Colors from '@renderer/modules/Colors'
import {
  IRaceControlMessage,
  IRaceControlMessages,
  ISessionInfo,
  ITrackStatus,
  ITrackStatusStatus,
  TRaceControlMessageFlag,
  TRaceControlMessageSubCategory
} from '@renderer/types/LiveTimingStateTypes'
import { contrastColor } from '@renderer/utils/textColor'
import { useEffect, useState } from 'react'

interface IData {
  RaceControlMessages?: IRaceControlMessages
  TrackStatus?: ITrackStatus
  SessionInfo?: ISessionInfo
}

const SectorStatuses = () => {
  const [sessionInfo, setSessionInfo] = useState<ISessionInfo | null>(null)
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])
  const [trackStatus, setTrackStatus] = useState<ITrackStatusStatus>('2')
  const [sectorCount, setSectorCount] = useState<number>(0)
  const [SectorStatuses, setSectorStatuses] = useState<
    (TRaceControlMessageFlag | TRaceControlMessageSubCategory)[]
  >([])

  const getSectorStatuses = (messages: IRaceControlMessage[], trackStatus: ITrackStatusStatus) => {
    const newSectorStatuses: (TRaceControlMessageFlag | TRaceControlMessageSubCategory)[] =
      Array(sectorCount).fill('CLEAR')

    console.log(newSectorStatuses)

    messages.forEach((message) => {
      const category = message.SubCategory ?? message.Category

      console.log(message)

      switch (category) {
        case 'TrackSurfaceSlippery':
          newSectorStatuses[parseInt(message.Message.split(' ').slice(-1)[0]) - 1] = category
          break
        case 'Flag':
          if (message.Sector) {
            newSectorStatuses[message.Sector - 1] = message.Flag
          }
      }
    })

    console.log(newSectorStatuses)

    return trackStatus !== '1'
      ? newSectorStatuses
      : newSectorStatuses.map((status) => (status === 'TrackSurfaceSlippery' ? status : 'CLEAR'))
  }

  console.log(SectorStatuses)

  useEffect(() => {
    console.log(raceControlMessages)
    setSectorStatuses(getSectorStatuses(raceControlMessages ?? [], trackStatus))
  }, [sectorCount, raceControlMessages, setSectorStatuses, trackStatus])

  const handleDataReceived = (data: IData) => {
    const {
      SessionInfo: dataSessionInfo,
      RaceControlMessages: dataRaceControlMessages,
      TrackStatus: dataTrackStatus
    } = data

    if (dataSessionInfo && JSON.stringify(dataSessionInfo) !== JSON.stringify(sessionInfo)) {
      setSessionInfo(dataSessionInfo)

      const circuitId = dataSessionInfo.Meeting.Circuit.Key

      const year = new Date(dataSessionInfo.StartDate).getFullYear()

      getCircuitInfo(circuitId, year).then((circuitInfo) => {
        setSectorCount(circuitInfo?.marshalSectors?.length ?? 0)
      })
    }

    if (JSON.stringify(raceControlMessages) !== JSON.stringify(dataRaceControlMessages?.Messages)) {
      setRaceControlMessages(dataRaceControlMessages?.Messages ?? [])
    }

    if (dataTrackStatus && dataTrackStatus?.Status !== trackStatus) {
      setTrackStatus(dataTrackStatus?.Status)
    }
  }

  LiveTiming(['SessionInfo', 'RaceControlMessages', 'TrackStatus'], handleDataReceived, speed4)

  return (
    <div className={styles.container}>
      <div style={{ background: TrackStatusColors[trackStatus] }} className={styles.header}>
        <p style={{ color: contrastColor(TrackStatusColors[trackStatus]) }}>
          {TrackStatusText[trackStatus]}
        </p>
      </div>
      <div className={styles.sectors}>
        {}

        {SectorStatuses?.map((status, index) => {
          console.log(status)
          return (
            <div key={index} className={styles.sector}>
              <p className={styles.number}>SECTOR {index + 1}</p>
              <div style={{ background: SectorStatusColors[status] }} className={styles.status}>
                <p style={{ color: contrastColor(SectorStatusColors[status]) ?? Colors.black }}>
                  {SectorStatusText[status] ?? status}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SectorStatuses
