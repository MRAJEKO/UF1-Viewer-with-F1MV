import { useState } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { Datum, ResponsiveBullet } from '@nivo/bullet'

import styles from '@renderer/components/Weather/Weather.module.scss'

import compass from '@renderer/assets/icons/compass.png'

import { weatherSettings } from '@renderer/modules/Settings'
import { getWindDirection } from '@renderer/utils/getWeatherInformation'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { speed4 } from '@renderer/constants/refreshIntervals'
import { ISessionInfo, IWeatherDataSeries } from '@renderer/types/LiveTimingStateTypes'
import {
  milisecondsToHoursMinutesTime,
  timeToMiliseconds,
  timestampToMiliseconds
} from '@renderer/utils/convertTime'
import MoveMode from '@renderer/components/MoveMode'

const { getCircuitInfo } = window.mvApi

const colors = ['#1E90FF', '#FF4500']

const infoColors = ['#FF5349', '#87CEFA', '#FF5349']

const measureColors = ['#1E90FF']

const maxColor = ['#FF4500']

const TempToolTip = ({ point }) => (
  <div style={{ background: 'white', padding: '10px', borderRadius: '20px ' }}>
    <strong>{point.serieId}</strong>
    <br />
    <strong>{point.data.xFormatted}</strong> - {String(point.data.yFormatted)}°C
  </div>
)

const WindToolTip = ({ point }) => (
  <div style={{ background: 'white', padding: '10px', borderRadius: '20px ' }}>
    <strong>{point.serieId}</strong>
    <br />
    <strong>{point.data.xFormatted}</strong> - {String(point.data.yFormatted)} km/h
  </div>
)

interface IModifiedData {
  id: string
  color: string
  data: { x: string; y: number }[]
}

interface IData {
  WeatherDataSeries?: IWeatherDataSeries
  SessionInfo?: ISessionInfo
}

const Weather = () => {
  const [tempData, setTempData] = useState<IModifiedData[]>([])
  const [windData, setWindData] = useState<IModifiedData[]>([])
  const [humidityData, setHumidityData] = useState<Datum[]>([])
  const [pressureData, setPressureData] = useState<Datum[]>([])
  const [windDirection, setWindDirection] = useState<number>(0)
  const [windSpeed, setWindSpeed] = useState<number>(0)

  const [raining, setRaining] = useState<boolean>(false)

  const [maxDatapoints, setMaxDatapoints] = useState<number>(
    weatherSettings?.settings?.datapoints?.value ?? 30
  )

  const [rotation, setRotation] = useState<number>(0)

  const [meetingKey, setMeetingKey] = useState<number | null>(null)

  const [getNewData, setGetNewData] = useState<boolean>(false)

  const handleDataReceived = (data: IData) => {
    const { SessionInfo: dataSessionInfo, WeatherDataSeries: dataWeatherDataSeries } = data

    if (
      weatherSettings?.settings?.use_trackmap_rotation?.value &&
      dataSessionInfo?.Meeting.Key &&
      dataSessionInfo?.Meeting.Key !== meetingKey
    ) {
      setMeetingKey(dataSessionInfo?.Meeting.Key)

      const year = new Date(dataSessionInfo.StartDate).getFullYear()

      const circuitId = dataSessionInfo.Meeting.Circuit.Key

      getCircuitInfo(circuitId, year).then((circuitInfo) => {
        setRotation(circuitInfo?.rotation ?? 0)
      })
    }

    if (getNewData) setGetNewData(false)

    const timeOffset = timeToMiliseconds(dataSessionInfo?.GmtOffset ?? 0)
    const rangeWeatherData = dataWeatherDataSeries?.Series?.slice(
      (dataWeatherDataSeries?.Series?.length ?? 0) - maxDatapoints
    )
    const latestData = dataWeatherDataSeries?.Series?.slice(-1)[0].Weather

    const graphData = rangeWeatherData?.map((serie) => {
      const { AirTemp, TrackTemp, WindSpeed } = serie.Weather

      const time = milisecondsToHoursMinutesTime(
        timestampToMiliseconds(serie.Timestamp) + timeOffset
      )

      const airTempCoord = { x: time, y: parseFloat(AirTemp) }

      const trackTempCoord = { x: time, y: parseFloat(TrackTemp) }

      const windSpeedCoord = { x: time, y: parseFloat(WindSpeed) * 3.6 }

      return [airTempCoord, trackTempCoord, windSpeedCoord]
    })

    const maxHumidity = Math.max(
      ...(dataWeatherDataSeries?.Series?.map((serie) => parseFloat(serie.Weather.Humidity)) ?? [0])
    )

    const maxPressure = Math.max(
      ...(dataWeatherDataSeries?.Series?.map((serie) => parseFloat(serie.Weather.Pressure)) ?? [0])
    )

    const humidity = parseFloat(latestData?.Humidity ?? '0')
    const pressure = parseFloat(latestData?.Pressure ?? '0')

    setTempData([
      {
        id: 'Air Temp',
        color: 'hsl(0, 100%, 36%)',
        data: graphData?.map((data) => data[0]) ?? []
      },
      {
        id: 'Track Temp',
        color: 'hsl(131, 100%, 36%)',
        data: graphData?.map((data) => data[1]) ?? []
      }
    ])

    setWindData([
      {
        id: 'Wind Speed',
        color: 'hsl(0, 100%, 36%)',
        data: graphData?.map((data) => data[2]) ?? []
      }
    ])

    setHumidityData([
      {
        id: 'Humidity',
        ranges: [0, 40, 100],
        measures: [humidity],
        markers: [maxHumidity]
      }
    ])

    setPressureData([
      {
        id: 'Pressure',
        ranges: [0, 950, 1050, 1075],
        measures: [pressure],
        markers: [maxPressure]
      }
    ])

    setWindDirection(parseFloat(latestData?.WindDirection ?? '0'))

    setWindSpeed(parseFloat(latestData?.WindSpeed ?? '0'))

    setRaining(latestData?.Rainfall === '1')
  }

  LiveTiming(['WeatherDataSeries', 'SessionInfo'], handleDataReceived, speed4, getNewData)

  console.log(maxDatapoints)

  const handleButtonPress = (newValue: number) => {
    setGetNewData(true)
    setMaxDatapoints(newValue)
  }

  return (
    <>
      <MoveMode />
      <div className={styles.container}>
        <div className={styles.buttons}>
          <button
            className={styles['big-decrease']}
            onClick={() => handleButtonPress(maxDatapoints - 10)}
          >
            -10
          </button>
          <button
            className={styles['small-decrease']}
            onClick={() => handleButtonPress(maxDatapoints - 1)}
          >
            -1
          </button>
          <button
            className="reset"
            onClick={() => handleButtonPress(weatherSettings?.settings.datapoints?.value ?? 30)}
          >
            Reset
          </button>
          <button
            className={styles['small-increase']}
            onClick={() => handleButtonPress(maxDatapoints + 1)}
          >
            +1
          </button>
          <button
            className={styles['big-increase']}
            onClick={() => handleButtonPress(maxDatapoints + 10)}
          >
            +10
          </button>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graph}>
            <ResponsiveLine
              data={tempData}
              colors={colors}
              margin={{ top: 10, right: 100, bottom: 40, left: 30 }}
              xScale={{
                type: 'time',
                format: '%H:%M',
                precision: 'minute'
              }}
              xFormat="time:%H:%M"
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              yFormat=" >-.1f"
              curve="cardinal"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                format: '%H:%M',
                tickSize: 10,
                tickValues: 5,
                tickPadding: 5,
                tickRotation: 0
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickValues: 5,
                tickRotation: 0
              }}
              lineWidth={4}
              pointSize={10}
              pointColor={{ from: 'color', modifiers: [] }}
              pointBorderWidth={0}
              pointBorderColor=""
              pointLabelYOffset={-12}
              useMesh={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#ffffff'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#555555'
                  }
                }
              }}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, 1)',
                  itemTextColor: '#ffffff',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={TempToolTip}
            />
          </div>

          <div className={styles.graph}>
            <ResponsiveLine
              data={windData}
              colors={colors}
              margin={{ top: 10, right: 100, bottom: 40, left: 30 }}
              xScale={{
                type: 'time',
                format: '%H:%M',
                precision: 'minute'
              }}
              xFormat="time:%H:%M"
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              yFormat=" >-.1f"
              curve="cardinal"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                format: '%H:%M',
                tickSize: 10,
                tickValues: 5,
                tickPadding: 5,
                tickRotation: 0
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickValues: 5,
                tickRotation: 0
              }}
              lineWidth={4}
              pointSize={10}
              pointColor={{ from: 'color', modifiers: [] }}
              pointBorderWidth={0}
              pointBorderColor=""
              pointLabelYOffset={-12}
              useMesh={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#ffffff'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#555555'
                  }
                }
              }}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, 1)',
                  itemTextColor: '#ffffff',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={WindToolTip}
            />
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.bullet}>
            <ResponsiveBullet
              data={humidityData}
              margin={{ top: 5, right: 50, bottom: 10, left: 0 }}
              layout="vertical"
              spacing={50}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#ffffff'
                    }
                  }
                }
              }}
              titleAlign="middle"
              titleOffsetX={0}
              titleOffsetY={16}
              rangeColors={infoColors}
              measureColors={measureColors}
              markerColors={maxColor}
              measureSize={0.35}
              markerSize={0.65}
            />
            <ResponsiveBullet
              data={pressureData}
              margin={{ top: 5, right: 50, bottom: 10, left: 0 }}
              layout="vertical"
              spacing={50}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#ffffff'
                    }
                  }
                }
              }}
              titleAlign="middle"
              titleOffsetX={0}
              titleOffsetY={16}
              rangeColors={infoColors}
              measureColors={measureColors}
              markerColors={maxColor}
              measureSize={0.35}
              markerSize={0.65}
              minValue={900}
            />
          </div>
          <div className={`${styles.rain} ${raining ? styles.red : styles.blue}`}>
            <p>{raining ? 'RAINING' : 'NO RAIN'}</p>
          </div>
          <div className={styles['wind-direction']}>
            <p>
              {getWindDirection(windDirection)} | {windDirection}° | {(windSpeed * 3.6).toFixed(1)}{' '}
              km/h
            </p>
            <div className={styles['compass-container']}>
              <img
                className={styles.compass}
                style={{ transform: `rotate(${windDirection + rotation}deg)` }}
                src={compass}
              />
            </div>
            <p>WIND DIRECTION</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Weather
