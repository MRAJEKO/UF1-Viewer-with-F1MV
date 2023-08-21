import React from 'react'
import { IPlayer } from '@renderer/types/Players'
import { getConfig } from '@renderer/utils/getConfig'
import { sleep } from '@renderer/utils/sleep'

const {
  getAllPlayers,
  setSpeedometerVisibility,
  getPlayerBounds,
  createPlayer,
  removePlayer,
  syncPlayers,
  setAlwaysOnTop
} = window.mvApi

export const getShownDrivers = async (
  contentId: string | number | null,
  setContentId: React.Dispatch<React.SetStateAction<string | number | null>>,
  mainWindow: number | null,
  setMainWindow: React.Dispatch<React.SetStateAction<number | null>>,
  mainWindowName: string | null,
  setActualMainWindowName: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const config = getConfig()

  if (!config) return null

  const players = (await getAllPlayers(config)) as IPlayer[]

  if (!players.length) return null

  const shownDrivers = players.reduce((acc, player) => {
    if (player.driverData) {
      acc[player.driverData.driverNumber] = parseInt(player.id)
    }
    return acc
  }, {})

  const newMainWindow =
    parseInt(players.find((player) => player.streamData.title === mainWindowName)?.id ?? '0') ??
    parseInt(players.find((player) => player.streamData.title === 'INTERNATIONAL')?.id ?? '0') ??
    null

  if (newMainWindow && newMainWindow !== mainWindow) {
    setMainWindow(newMainWindow)
    setActualMainWindowName(
      players.find((player) => parseInt(player.id) === newMainWindow)?.streamData.title ?? null
    )
  }

  if (contentId !== players[0]?.streamData?.contentId)
    setContentId(players[0]?.streamData?.contentId)

  return shownDrivers
}

export const replaceWindow = async (
  oldWindowId: number,
  newDriverNumber: number,
  contentId: string | number,
  enableSpeedometer: boolean,
  mainWindow: number | null
) => {
  const config = getConfig()

  if (!config) return false

  const bounds = await getPlayerBounds(config, oldWindowId)

  const newWindow = await createPlayer(config, newDriverNumber, contentId, bounds, false)

  if (!newWindow.errors) {
    const newWindowId = newWindow.data.playerCreate

    await sleep(2500)

    if (enableSpeedometer) await setSpeedometerVisibility(config, newWindowId, true)

    mainWindow = mainWindow ?? oldWindowId

    await syncPlayers(config, mainWindow)

    await sleep(3000)

    await setAlwaysOnTop(config, newWindowId, true, 'FLOATING')

    await removePlayer(config, oldWindowId)
  } else {
    console.log(newWindow.errors[0].message)
    return false
  }

  return true
}
