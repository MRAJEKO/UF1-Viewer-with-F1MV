import styles from '@renderer/components/BattleMode/BattleMode.module.scss'
import BattleModeLine from '@renderer/components/BattleMode/BattleModeLine'
import MoveMode from '@renderer/components/MoveMode'
import { driverHeadshotFallback } from '@renderer/constants/images'
import { speed4 } from '@renderer/constants/refreshIntervals'
import useLiveTiming from '@renderer/hooks/useLiveTiming'
import {
  ICarData,
  IDriverList,
  ISessionInfo,
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
  SessionInfo: ISessionInfo
}

const BattleMode = () => {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])

  const [LiveTimingData, setLiveTimingData] = useState<ILiveTimingData | null>(null)

  const handleDataReceived = (data: ILiveTimingData) => {
    if (JSON.stringify(data) === JSON.stringify(LiveTimingData)) return

    setLiveTimingData(data)
  }

  useLiveTiming(
    ['DriverList', 'CarData', 'TimingData', 'TimingAppData', 'SessionInfo'],
    handleDataReceived,
    speed4
  )

  return (
    <>
      <MoveMode horizontal />
      <div className={styles.container}>
        <div className={styles.select}>
          {Object.values(LiveTimingData?.DriverList || {}).map((driver) => (
            <button
              style={{
                borderColor: `#${driver.TeamColour || 'fff'}`,
                color: `#${driver.TeamColour || 'fff'}`,
                opacity: selectedDrivers.includes(driver.RacingNumber) ? 1 : 0.2
              }}
              key={driver.RacingNumber}
              onClick={() => {
                if (selectedDrivers.includes(driver.RacingNumber)) {
                  setSelectedDrivers(
                    selectedDrivers.filter((RacingNumber) => RacingNumber !== driver.RacingNumber)
                  )
                } else {
                  if (selectedDrivers.length < 3) {
                    setSelectedDrivers([...selectedDrivers, driver.RacingNumber])
                  }
                }
              }}
            >
              {driver.Tla}
            </button>
          ))}
        </div>
        {selectedDrivers.length ? (
          <>
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
          </>
        ) : (
          <div className={styles.fallback}>
            <p>SELECT DRIVERS BY HOVERING</p>
          </div>
        )}
      </div>
    </>
  )
}
export default BattleMode
