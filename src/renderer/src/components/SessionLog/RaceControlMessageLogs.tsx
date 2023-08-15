import {
  IDriverList,
  IRaceControlMessage,
  IRaceControlMessages,
  ISessionData,
  ISessionInfo
} from '@renderer/types/LiveTimingStateTypes'
import DoubleSessionLog from './DoubleSessionLog'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionLog } from '@renderer/pages/SessionLog'
import { isWantedCategory } from '@renderer/utils/isWantedMessage'
import { updateLogs } from '@renderer/utils/updateLogs'

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
  RaceControlMessages?: IRaceControlMessages
  DriverList?: IDriverList
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const WANTED_CATEGORIES: (IRaceControlMessage['SubCategory'] | IRaceControlMessage['Category'])[] =
  [
    'Flag',
    'Other',
    'LapTimeDeleted',
    'TimePenalty',
    'TrackSurfaceSlippery',
    'PitEntry',
    'PitExit',
    'Drs',
    'LowGripConditions',
    'NormalGripConditions'
  ]

const GenerateLog = (data: IData, raceControlMessage: IRaceControlMessage) => {
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

    case 'PitEntry': {
      return {
        time: time,
        key: time + raceControlMessage.Message,
        element: (
          <DoubleSessionLog
            title="Pitlane"
            color1={Colors.darkblue + sessionLogHexModifier}
            color2={
              (raceControlMessage.Flag === 'CLOSED' ? Colors.red : Colors.green) +
              sessionLogHexModifier
            }
            time={raceControlMessage.Utc}
            left="Pit Entry"
            right={raceControlMessage.Flag}
            data={data}
          />
        )
      }
    }

    case 'PitExit': {
      return {
        time: time,
        key: time + raceControlMessage.Message,
        element: (
          <DoubleSessionLog
            title="Pitlane"
            color1={Colors.darkblue + sessionLogHexModifier}
            color2={
              (raceControlMessage.Flag === 'CLOSED' ? Colors.red : Colors.green) +
              sessionLogHexModifier
            }
            time={raceControlMessage.Utc}
            left="Pit Exit"
            right={raceControlMessage.Flag}
            data={data}
          />
        )
      }
    }
  }

  return null
}

const RaceControlMessageLogs = (
  newLogs: ISessionLog[],
  data: IData,
  raceControlMessages: IRaceControlMessage[] | null,
  setRaceControlMessages: React.Dispatch<React.SetStateAction<IRaceControlMessage[]>>,
  trackTimeUtc: number
) => {
  const { RaceControlMessages: dataRaceControlMessages } = data

  const wantedRaceControlMessages = dataRaceControlMessages?.Messages?.filter(
    (raceControlMessage) => isWantedCategory(raceControlMessage, WANTED_CATEGORIES)
  )

  if (
    wantedRaceControlMessages &&
    raceControlMessages &&
    wantedRaceControlMessages.length !== raceControlMessages?.length
  ) {
    const { newData, modifiedLogs } = updateLogs(
      newLogs,
      wantedRaceControlMessages,
      raceControlMessages,
      trackTimeUtc,
      (raceControlMessage: IRaceControlMessage) => GenerateLog(data, raceControlMessage)
    )

    setRaceControlMessages(newData)

    return modifiedLogs
  }

  return newLogs
}

export default RaceControlMessageLogs
