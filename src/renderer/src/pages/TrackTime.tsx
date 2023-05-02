import LiveTimingClock from '@renderer/hooks/useLiveTimingClock'
import { useCallback, useState } from 'react'

interface IValues {
  paused: boolean
  systemTime: string
  trackTime: string
  liveTimingStartTime: string
}

const TrackTime = () => {
  const [values, setValues] = useState<null | IValues>(null)

  const handleDataReceived = useCallback(
    (data: IValues) => {
      if (!data) return

      if (JSON.stringify(data) === JSON.stringify(values)) return

      setValues(data)
    },
    [values]
  )

  LiveTimingClock(
    ['paused', 'systemTime', 'trackTime', 'liveTimingStartTime'],
    handleDataReceived,
    500
  )

  console.log(values)

  return <div style={{ color: 'white' }}>{values?.paused ? 'paused' : 'unpaused'}</div>
}

export default TrackTime
