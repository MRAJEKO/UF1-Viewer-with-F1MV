import { IDriver } from '@renderer/types/LiveTimingStateTypes'
import { milisecondsToTime } from '@renderer/utils/convertTime'

interface IProps {
  driverInfo: IDriver
  utc: string
  gmtOffset: number
  duration?: number
}

const RadioInfo = ({ driverInfo, utc, gmtOffset, duration }: IProps) => {
  return (
    <p>
      {driverInfo.FullName} {milisecondsToTime(new Date(utc).getTime() + gmtOffset)}{' '}
      {Math.floor(Math.round(duration || 0) / 60)}:
      {(Math.round(duration || 0) % 60).toString().padStart(2, '0')}
    </p>
  )
}

export default RadioInfo
