import { useEffect } from 'react'
import { ClockTopic, LiveTimingClockAPIGraphQL, Topic } from 'npm_f1mv_api'
import { ILiveTimingState } from '../types/LiveTimingStateTypes'

const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const LiveTimingStateClock = (
  topics: Topic[],
  clockTopics: ClockTopic[],
  onDataReceived: (stateData: any, clockData: any) => void,
  updateFrequency: number
) => {
  useEffect(() => {
    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response: ILiveTimingState = await LiveTimingAPIGraphQL(config, topics)

        const clockResponse = await LiveTimingClockAPIGraphQL(config, clockTopics)

        if (response) {
          onDataReceived(response, clockResponse)
        }
      } catch (error) {
        console.log(error)
      }
    }

    const intervalId = setInterval(fetchData, updateFrequency)
    return () => clearInterval(intervalId)
  }, [onDataReceived])
}

export default LiveTimingStateClock
