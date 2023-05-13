import {
  IDriverList,
  IRaceControlMessage,
  ISessionData,
  ISessionInfo
} from '@renderer/types/LiveTimingStateTypes'
import DoubleSessionLog from './DoubleSessionLog'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'

const baseImageUrl = 'src/renderer/src/assets/icons'

const getDriver = (
  driverList: IDriverList | undefined,
  message: IRaceControlMessage['Message']
) => {
  if (!driverList) return undefined
  const driver = [
    Object.keys(driverList).find((driver) =>
      message.includes(`${driverList[driver].Tla} ${driver}`)
    )
  ][0]

  if (driver) return driverList?.[driver]
  return undefined
}

interface IData {
  DriverList?: IDriverList
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const GenerateRaceControlMessageLog = (data: IData, raceControlMessage: IRaceControlMessage) => {
  const time = new Date(
    raceControlMessage.Utc.endsWith('Z') ? raceControlMessage.Utc : raceControlMessage.Utc + 'Z'
  ).getTime()

  const category = raceControlMessage.SubCategory ?? raceControlMessage.Category

  const message = raceControlMessage.Message

  const driver = getDriver(data.DriverList, message)

  switch (category) {
    case 'Flag': {
      let image = ''

      switch (raceControlMessage.Flag) {
        case 'BLACK AND WHITE':
          image = baseImageUrl + '/flags/blackandwhite.png'
          if (driver) {
          }
        case 'BLACK AND ORANGE':
          image = baseImageUrl + '/flags/blackandorange.png'
      }
      break
    }

    case 'Drs': {
      return {
        time: time,
        key: time + raceControlMessage.Message,
        element: (
          <DoubleSessionLog
            title="DRS"
            color1={Colors.green + sessionLogHexModifier}
            color2={
              (raceControlMessage.Flag === 'ENABLED' ? Colors.green : Colors.red) +
              sessionLogHexModifier
            }
            time={raceControlMessage.Utc}
            left="DRS"
            right={raceControlMessage.Flag}
            subInfo={message.indexOf('ZONE') > -1 ? message.slice(message.indexOf('ZONE')) : null}
            data={data}
          />
        )
      }
    }
  }

  return null
}

export default GenerateRaceControlMessageLog
