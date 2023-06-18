import { milisecondsToDaysTime } from '@renderer/utils/convertTime'
import { useEffect, useState } from 'react'
import Timer from './Timer'
import Info from './Info'
import styles from './Schedule.module.scss'

const Schedule = () => {
  const [flag, setFlag] = useState<string | null>(null)
  const [nextSessionStartTime, setNextSessionStartTime] = useState<number | null>(null)
  const [nextSessionName, setNextSessionName] = useState<string | null>(null)
  const [nextEventInfo, setnextEventInfo] = useState<any>(null)
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [now])

  useEffect(() => {
    fetch('http://ergast.com/api/f1/current/next.json')
      .then((res) => {
        res.json().then((data: any) => {
          if (!data) return

          const nextEvent = data.MRData?.RaceTable?.Races[0]

          setnextEventInfo(nextEvent)

          const country = nextEvent?.Circuit?.Location?.country

          try {
            const requestedKeys = Object.keys(nextEvent).slice(
              Object.keys(nextEvent).indexOf('date')
            )

            const sessions = {
              ...requestedKeys.slice(2).reduce((obj, key) => {
                obj[key] = `${nextEvent[key]?.date}T${nextEvent[key]?.time}`
                return obj
              }, {}),
              Race: `${nextEvent?.date}T${nextEvent?.time}`
            }

            for (const key in sessions) {
              if (sessions[key]) {
                const sessionTime = new Date(sessions[key]).getTime()
                if (sessionTime > now) {
                  setNextSessionStartTime(sessionTime)
                  setNextSessionName(key)
                  break
                }
              }
            }
          } catch (e) {
            return
          }

          if (!country) return

          fetch(`https://restcountries.com/v3.1/name/${country.toLowerCase()}`)
            .then((res) => {
              res.json().then((data: any) => {
                if (!data || !Array.isArray(data)) return

                setFlag(
                  data.find(
                    (countryData) => countryData.name.common.toLowerCase() === country.toLowerCase()
                  )?.flags.png ??
                    data[0].flags.png ??
                    null
                )
              })
            })
            .catch((e) => {
              console.log(e)
            })
        })
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  return (
    <div
      className={styles.container}
      style={{
        height: `${flag && nextSessionStartTime ? '80px' : 0}`,
        border: `${flag && nextSessionStartTime ? '' : 'none'}`
      }}
    >
      {nextEventInfo && nextSessionName && (
        <Info flag={flag} nextSessionName={nextSessionName} nextEventInfo={nextEventInfo} />
      )}
      {nextSessionStartTime && now && (
        <Timer
          timer={nextSessionStartTime ? milisecondsToDaysTime(nextSessionStartTime - now) : null}
        />
      )}
    </div>
  )
}

export default Schedule
