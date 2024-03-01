import styles from '@renderer/components/BattleMode/BattleMode.module.scss'
import BattleModeLine from '@renderer/components/BattleMode/BattleModeLine'
import MoveMode from '@renderer/components/MoveMode'
import { driverHeadshotFallback } from '@renderer/constants/images'
import { speed4 } from '@renderer/constants/refreshIntervals'
import useLiveTiming from '@renderer/hooks/useLiveTiming'
import {
  ICarData,
  IDriverList,
  ILiveTimingState,
  ITimingAppData,
  ITimingData
} from '@renderer/types/LiveTimingStateTypes'
import { sortDriversOnPosition } from '@renderer/utils/order'
import { useState } from 'react'

export interface ILiveTimingData {
  DriverList: IDriverList
  CarData: ICarData
  TimingData: ITimingData
  TimingAppData: ITimingAppData
}

const BattleMode = () => {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(['1', '77', '4'])

  const [LiveTimingData, setLiveTimingData] = useState<ILiveTimingData | null>(null)

  const handleDataReceived = (data: ILiveTimingData) => {
    if (JSON.stringify(data) === JSON.stringify(LiveTimingData)) return

    setLiveTimingData(data)
  }

  useLiveTiming(
    ['DriverList', 'CarData', 'TimingData', 'TimingAppData'],
    handleDataReceived,
    speed4
  )

  return (
    <>
      <MoveMode horizontal />
      <div className={styles.container}>
        <div className={styles.headshots}>
          {selectedDrivers.map((driver) => (
            <img
              key={driver}
              src={
                LiveTimingData?.DriverList?.[driver]?.HeadshotUrl?.replace('1col', '12col') ||
                driverHeadshotFallback
              }
            />
          ))}
        </div>
        <div className={styles.data}>
          {sortDriversOnPosition(selectedDrivers, LiveTimingData).map((driver, index) => (
            <BattleModeLine
              driverAhead={selectedDrivers[index - 1]}
              index={index}
              driver={driver}
              liveTimingData={LiveTimingData}
            />
          ))}
        </div>
      </div>
    </>
  )
}
export default BattleMode
