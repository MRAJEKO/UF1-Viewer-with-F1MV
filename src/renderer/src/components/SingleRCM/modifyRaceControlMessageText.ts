import { MessageColorMappings } from '@renderer/constants/RaceControlMessageMappings'
import { IDriverList } from '@renderer/types/LiveTimingStateTypes'

export const modifyRaceControlMessageText = (message: string, driverList: IDriverList | null) => {
  let newMessage = MessageColorMappings.reduce((output, mapping) => {
    const regex = new RegExp(mapping.match, 'g')
    const colorSpan = `<span style="color: ${mapping.color};">${mapping.match}</span>`
    return output.replace(regex, colorSpan)
  }, message)

  if (!driverList) return newMessage

  const driverRegex = /\d+ \(\S{3}\)/g
  const driverMatches = newMessage.match(driverRegex)
  for (const match of driverMatches || []) {
    const [driverNumber] = match.split(' ')
    newMessage = newMessage.replace(
      match,
      `<span style="color: #${driverList[driverNumber].TeamColour};">${match}</span>`
    )
  }

  const turnRegex = /TURN \d+/g
  const turnMatches = newMessage.match(turnRegex)
  for (const match of turnMatches || []) {
    newMessage = newMessage.replace(
      match,
      `<span style="text-decoration: underline">${match}</span>`
    )
  }

  return newMessage
}
