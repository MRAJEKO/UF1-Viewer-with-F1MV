import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { useEffect } from 'react'
import { ClockTopic, LiveTimingClockAPIGraphQL, Topic } from 'npm_f1mv_api'
import { ILiveTimingClockData } from './useLiveTimingClock'

const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const useLiveTimingStateClock = (
  topics: Topic[],
  clockTopics: ClockTopic[],
  onDataReceived: (
    stateData: ILiveTimingState,
    clockData: ILiveTimingClockData,
    firstPatch: boolean
  ) => void,
  updateFrequency: number
) => {
  useEffect(() => {
    let count = 0

    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response: ILiveTimingState = await LiveTimingAPIGraphQL(config, topics)

        const clockResponse = await LiveTimingClockAPIGraphQL(config, clockTopics)

        if (response) {
          onDataReceived(response, clockResponse, count === 0)
        }

        count++
      } catch (error) {
        console.log(error)
      }
    }

    const intervalId = setInterval(fetchData, updateFrequency)
    return () => clearInterval(intervalId)
  }, [onDataReceived])
}

export default useLiveTimingStateClock
