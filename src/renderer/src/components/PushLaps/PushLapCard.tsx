import useTrackTime from '@renderer/hooks/useTrackTime'
import {
  IDriverList,
  ISessionInfo,
  ITimingAppData,
  ITimingData,
  ITimingStats
} from '@renderer/types/LiveTimingStateTypes'

import { teamIcons } from '@renderer/assets/icons/teams/teamIcons'
import { speed1 } from '@renderer/constants/refreshIntervals'
import { compoundColorMapping, compoundLetterMapping } from '@renderer/constants/tyreMappings'
import Colors from '@renderer/modules/Colors'
import { milisecondsToF1 } from '@renderer/utils/convertTime'
import {
  firstSectorCompleted,
  getTargetData as getTargetDriverNumber,
  isDriverInDanger,
  lapCompleted
} from '@renderer/utils/driver'
import { contrastColor } from '@renderer/utils/textColor'
import { useEffect, useState } from 'react'
import styles from './PushLapCard.module.scss'
import PushLapCardSector from './PushLapCardSector'
import PushLapCardTarget from './PushLapCardTarget'

export interface ICardData {
  timingData?: ITimingData
  timingAppData?: ITimingAppData
  timingStats?: ITimingStats
  driverList?: IDriverList
  sessionType?: ISessionInfo['Type']
}

interface IPushLapCardProps {
  pushing: boolean
  driverNumber: string
  data: ICardData
  lapStartTime?: number
  setShownDrivers: React.Dispatch<React.SetStateAction<string[]>>
  endOfLapAnimationDuration: number
  endOfSectorAnimationDuration: number
}

const PushLapCard = ({
  pushing,
  driverNumber,
  data,
  lapStartTime,
  setShownDrivers,
  endOfLapAnimationDuration
}: // endOfSectorAnimationDuration
IPushLapCardProps) => {
  const { trackTimeUtc } = useTrackTime(speed1)

  const [actualData, setActualData] = useState<ICardData | null>(null)

  const [shouldUpdate, setShouldUpdate] = useState<boolean>(true)

  useEffect(() => {
    if (shouldUpdate) setActualData(data)
    if (!pushing) setShouldUpdate(false)
  }, [data, shouldUpdate, pushing])

  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    if (pushing) {
      setTimeout(() => {
        setShow(true)
      }, 100)
    } else {
      setTimeout(() => {
        setShow(false)

        setTimeout(() => {
          setShownDrivers((prev) => prev.filter((driver) => driver !== driverNumber))
        }, 1000)
      }, endOfLapAnimationDuration)
    }
  }, [pushing])

  const { timingData, timingAppData, timingStats, driverList, sessionType } = actualData ?? {}

  const driverInfo = driverList?.[driverNumber]

  const driverTimingData = timingData?.Lines?.[driverNumber]

  const driverCompound = timingAppData?.Lines?.[driverNumber]?.Stints?.slice(-1)[0].Compound

  const driverTyre = compoundLetterMapping[driverCompound || 'UNKNOWN']

  const driverTyreColor = compoundColorMapping[driverCompound || 'UNKNOWN']

  const teamColour = driverInfo?.TeamColour ? `#${driverInfo?.TeamColour}` : `Colors.white`

  // console.log(trackTimeUtc)

  const isLapCompleted = lapCompleted(driverTimingData)

  const enteredPitlane = driverTimingData?.InPit

  const time = pushing
    ? lapStartTime
      ? milisecondsToF1(trackTimeUtc - lapStartTime, 1)
      : 'NO TIME'
    : enteredPitlane
    ? 'IN PIT'
    : driverTimingData?.Stopped
    ? 'STOPPED'
    : !isLapCompleted
    ? 'BACKED'
    : driverTimingData?.LastLapTime?.Value || 'NO TIME'

  const timeColor = pushing
    ? lapStartTime
      ? Colors.white
      : Colors.darkgray
    : !isLapCompleted || enteredPitlane || driverTimingData?.Stopped
    ? Colors.red
    : driverTimingData?.LastLapTime?.OverallFastest
    ? Colors.purple
    : driverTimingData?.LastLapTime?.PersonalFastest
    ? Colors.green
    : Colors.yellow

  const dangerZone = isDriverInDanger(driverNumber, timingData, sessionType)

  const targetDriverNumber = getTargetDriverNumber(
    driverNumber,
    timingData,
    sessionType,
    timingStats
  )

  return (
    <div className={`${styles.container} ${show ? styles.shown : ''}`}>
      <div className={styles.header}>
        <div style={{ backgroundColor: dangerZone ? Colors.red : '' }} className={styles.position}>
          <p style={{ color: dangerZone ? Colors.white : '' }}>
            {timingData?.Lines?.[driverNumber]?.Position ?? '?'}
          </p>
        </div>
        <div style={{ backgroundColor: teamColour }} className={styles['teamicon-name']}>
          <div className={styles.name}>
            <p style={{ color: contrastColor(teamColour) }}>
              {driverInfo?.LastName?.toUpperCase() ?? driverInfo?.Tla ?? 'Unknown'}
            </p>
          </div>
          <div className={styles.teamicon}>
            <img src={teamIcons[driverInfo?.TeamName ?? '']} alt="" />
          </div>
        </div>
        <div className={styles.tyre}>
          <p style={{ color: driverTyreColor }}>{driverTyre}</p>
        </div>
      </div>
      <div className={styles.timing}>
        <div className={styles.current}>
          <p style={{ color: timeColor }}>{time}</p>
        </div>
        <div className={styles.target}>
          <PushLapCardTarget
            pushing={pushing}
            firstSectorCompleted={
              timingData?.Lines?.[driverNumber]?.Sectors
                ? firstSectorCompleted(timingData.Lines[driverNumber].Sectors)
                : false
            }
            targetData={
              targetDriverNumber
                ? {
                    timingData: timingData?.Lines?.[targetDriverNumber],
                    timingStats: timingStats?.Lines?.[targetDriverNumber]
                  }
                : {}
            }
            driverNumber={driverNumber}
            data={{ timingData, driverList }}
          />
        </div>
      </div>
      <div className={styles.sectors}>
        {timingData?.Lines?.[driverNumber]?.Sectors?.map((sector, index) => (
          <PushLapCardSector
            lapCompleted={isLapCompleted}
            key={index}
            index={index}
            isPushing={pushing}
            firstSectorCompleted={firstSectorCompleted(timingData.Lines[driverNumber].Sectors)}
            sectorInfo={sector}
            targetTimingStats={
              targetDriverNumber
                ? timingData?.Lines?.[targetDriverNumber]?.BestLapTime?.Value
                  ? timingStats?.Lines?.[
                      timingData?.Lines?.[targetDriverNumber]?.RacingNumber ?? ''
                    ]
                  : undefined
                : undefined
            }
          />
        )) ?? <p>NO SECTOR DATA</p>}
      </div>
    </div>
  )
}
export default PushLapCard
