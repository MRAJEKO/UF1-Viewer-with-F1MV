import { useEffect, useState } from 'react'
import { Topic } from 'npm_f1mv_api'
import { ILiveTimingState } from '../types/LiveTimingStateTypes'

const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const LiveTiming = (
  topics: Topic[],
  onDataReceived: (data: any, firstPatch: boolean) => void,
  updateFrequency: number
) => {
  const [liveTimingState, setLiveTimingState] = useState<ILiveTimingState | null>(null)

  useEffect(() => {
    let count = 0

    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response: ILiveTimingState = await LiveTimingAPIGraphQL(config, topics)

        if (response && JSON.stringify(response) !== JSON.stringify(liveTimingState)) {
          onDataReceived(response, count === 0)
          setLiveTimingState(response)
        }

        count++
      } catch (error) {
        console.log(error)
      }
    }

    const intervalId = setInterval(fetchData, updateFrequency)
    return () => clearInterval(intervalId)
  }, [liveTimingState, onDataReceived])
}

export default LiveTiming
