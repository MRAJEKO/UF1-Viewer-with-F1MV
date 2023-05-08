import { useEffect } from 'react'
import { ClockTopic } from 'npm_f1mv_api'
const LiveTimingClockAPIGraphQL = window.mvApi.LiveTimingClockAPIGraphQL

export interface ILiveTimingClockData {
  paused: boolean
  systemTime: string
  trackTime: string
  liveTimingStartTime: string
}

const LiveTimingClock = (
  topics: ClockTopic[],
  onDataReceived: (data: any) => void,
  updateFrequency: number
) => {
  useEffect(() => {
    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response = await LiveTimingClockAPIGraphQL(config, topics)

        if (response) {
          onDataReceived(response)
        }
      } catch (error) {
        console.log(error)
      }
    }

    const intervalId = setInterval(fetchData, updateFrequency)
    return () => clearInterval(intervalId)
  }, [onDataReceived])
}

export default LiveTimingClock
