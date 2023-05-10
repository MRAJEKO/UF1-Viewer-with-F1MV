import {
  IDriverList,
  ILiveTimingState,
  IRaceControlMessage
} from '@renderer/types/LiveTimingStateTypes'

const baseImageUrl = 'src/renderer/src/assets/icons'

const getDriver = (driverList: IDriverList, message: IRaceControlMessage['Message']) => {
  const driver = [
    Object.keys(driverList).find((driver) =>
      message.includes(`${driverList[driver].Tla} ${driver}`)
    )
  ][0]

  if (driver) return driverList?.[driver]
  return undefined
}

export const generateRaceControlMessageLog = (
  data: ILiveTimingState,
  raceControlMessage: IRaceControlMessage
) => {
  const category = raceControlMessage.SubCategory ?? raceControlMessage.Category

  const driver = getDriver(data.DriverList, raceControlMessage.Message)

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
    }
  }
}
