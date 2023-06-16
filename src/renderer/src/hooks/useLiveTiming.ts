import { useEffect } from 'react'
import { Topic } from 'npm_f1mv_api'
import { ILiveTimingState } from '../types/LiveTimingStateTypes'

const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const LiveTiming = (
  topics: Topic[],
  onDataReceived: (data: any, firstPatch: boolean) => void,
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

        if (response) {
          onDataReceived(response, count === 0)
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

export default LiveTiming
