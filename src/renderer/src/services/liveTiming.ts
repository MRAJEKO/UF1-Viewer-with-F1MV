import { useEffect, useState } from 'react'
import topics from '../constants/apiTopics'

const LiveTiming = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const configString = localStorage.getItem('config')

      if (!configString) return

      const config = JSON.parse(configString)

      try {
        const response = await window.mvApi.LiveTimingAPIGraphQL(config, topics)

        if (JSON.stringify(response) !== JSON.stringify(data)) {
          setData(response)
        }
      } catch (error) {
        console.log(error)
      }
    }
    const intervalId = setInterval(fetchData, 100)
    return () => clearInterval(intervalId)
  }, [data])

  return data
}

export default LiveTiming
