import { useEffect } from 'react'
import { Topic } from 'npm_f1mv_api'
import { ILiveTimingData } from '../types/LiveTimingDataTypes'

const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const LiveTiming = (
  topics: Topic[],
  onDataReceived: (data: ILiveTimingData) => void,
  updateFrequency: number
) => {
  useEffect(() => {
    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response: ILiveTimingData = await LiveTimingAPIGraphQL(config, topics)

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

export default LiveTiming
