import useTrackTime from '@renderer/hooks/useTrackTime'
import {
  IDriverList,
  ITimingAppData,
  ITimingData,
  ITimingStats
} from '@renderer/types/LiveTimingStateTypes'

import styles from './PushLapCard.module.scss'
import { speed1 } from '@renderer/constants/refreshIntervals'
import { useEffect, useState } from 'react'
import { teamIcons } from '@renderer/assets/icons/teams/teamIcons'
import { compoundColorMapping, compoundLetterMapping } from '@renderer/constants/tyreMappings'
import Colors from '@renderer/modules/Colors'
import { contrastColor } from '@renderer/utils/textColor'
import PushLapCardSector from './PushLapCardSector'
import { milisecondsToF1 } from '@renderer/utils/convertTime'
import { firstSectorCompleted } from '@renderer/utils/driver'
import PushLapCardTarget from './PushLapCardTarget'

export interface ICardData {
  timingData?: ITimingData
  timingAppData?: ITimingAppData
  timingStats?: ITimingStats
  driverList?: IDriverList
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

  const [timingData, setTimingData] = useState<ITimingData | undefined>(data.timingData)

  const [timingStats, setTimingStats] = useState<ITimingStats | undefined>(data.timingStats)

  const [timingAppData, setTimingAppData] = useState<ITimingAppData | undefined>(data.timingAppData)

  const [driverList, setDriverList] = useState<IDriverList | undefined>(data.driverList)

  const [show, setShow] = useState<boolean>(pushing)

  // console.log(teamIcons)

  useEffect(() => {
    setTimingData(data.timingData)
  }, [data.timingData])

  useEffect(() => {
    setTimingStats(data.timingStats)
  }, [data.timingStats])

  useEffect(() => {
    setTimingAppData(data.timingAppData)
  }, [data.timingAppData])

  useEffect(() => {
    setDriverList(data.driverList)
  }, [data.driverList])

  useEffect(() => {
    if (pushing) setShow(true)
    else {
      setTimeout(() => {
        setShow(false)

        setTimeout(() => {
          setShownDrivers((prev) => prev.filter((driver) => driver !== driverNumber))
        }, 1000)
      }, endOfLapAnimationDuration)
    }
  }, [pushing])

  const driverInfo = driverList?.[driverNumber]

  const driverTimingData = timingData?.Lines?.[driverNumber]

  const driverCompound = timingAppData?.Lines?.[driverNumber]?.Stints?.slice(-1)[0].Compound

  const driverTyre = compoundLetterMapping[driverCompound || 'UNKNOWN']

  const driverTyreColor = compoundColorMapping[driverCompound || 'UNKNOWN']

  const teamColour = driverInfo?.TeamColour ? `#${driverInfo?.TeamColour}` : `Colors.white`

  // console.log(trackTimeUtc)

  const time = pushing
    ? lapStartTime
      ? milisecondsToF1(trackTimeUtc - lapStartTime, 1)
      : 'NO TIME'
    : driverTimingData?.LastLapTime?.Value ?? ' NO TIME'

  const timeColor = pushing
    ? lapStartTime
      ? Colors.white
      : Colors.darkgray
    : driverTimingData?.LastLapTime?.OverallFastest
    ? Colors.purple
    : driverTimingData?.LastLapTime?.PersonalFastest
    ? Colors.green
    : Colors.yellow

  // const dangerZone = false

  return (
    <div className={`${styles.container} ${show ? '' : styles.hide}`}>
      <div className={styles.header}>
        <div className={styles.position}>
          <p>{timingData?.Lines?.[driverNumber]?.Position ?? '?'}</p>
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
          <PushLapCardTarget data={{ timingData, driverList, timingStats }} />
        </div>
      </div>
      <div className={styles.sectors}>
        {timingData?.Lines?.[driverNumber]?.Sectors?.map((sector, index) => (
          <PushLapCardSector
            firstSectorCompleted={firstSectorCompleted(timingData.Lines[driverNumber].Sectors)}
            key={index}
            sectorInfo={sector}
          />
        )) ?? <p>NO SECTOR DATA</p>}
      </div>
    </div>
  )
}
export default PushLapCard
