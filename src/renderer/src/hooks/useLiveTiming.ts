import { useEffect } from 'react'
import { Topic } from 'npm_f1mv_api'
const LiveTimingAPIGraphQL = window.mvApi.LiveTimingAPIGraphQL

const LiveTiming = (
  topics: Topic[],
  onDataReceived: (data: any) => void,
  updateFrequency: number
) => {
  useEffect(() => {
    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response = await LiveTimingAPIGraphQL(config, topics)

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
