import LiveTiming from '../services/liveTiming'
import { useCallback, useState } from 'react'
import TrackStatus from '@renderer/components/FlagDisplay/TrackStatus'

const FlagDisplay = () => {
  const [trackStatus, setTrackStatus] = useState<null | number>(null)
  const [fastestLap, setFastestLap] = useState<null | string>(null)

  const onDataReceived = useCallback(
    (data: any) => {
      if (data) {
        if (parseInt(data?.TrackStatus?.Status ?? 0) !== trackStatus)
          setTrackStatus(parseInt(data?.TrackStatus?.Status ?? 0))

        const newFastestLap = Object.values(data?.TimingStats?.Lines ?? {})
          .map((driverTimingStats: any) => driverTimingStats.PersonalBestLapTime)
          .filter((personalBestLapTime: any) => personalBestLapTime.Position == 1)[0]?.Value

        if (newFastestLap && newFastestLap !== fastestLap) setFastestLap(newFastestLap)
      }
    },
    [trackStatus, fastestLap]
  )

  LiveTiming(['TrackStatus', 'TimingStats'], onDataReceived, 250)

  console.log(trackStatus)

  return <TrackStatus status={trackStatus} />
}

export default FlagDisplay
