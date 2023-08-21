import { TPlayers } from '@renderer/types/Players'
import { getConfig } from './getConfig'

const { getAllPlayers, setMutedPlayer, setVolumePlayer, setSpeedometerVisibility } = window.mvApi

export const reduceAllPlayersVolume = (reducePercentage: number) => {
  const config = getConfig()

  if (!config) return

  getAllPlayers(config).then((players: TPlayers) => {
    players.forEach((player) => {
      if (!player.state.muted)
        if (player.state.volume) {
          localStorage.setItem(`player-${player.id}-volume`, player.state.volume.toString())

          setVolumePlayer(config, player.id, player.state.volume * (reducePercentage / 100))
        }
    })
  })
}

export const restoreAllPlayersVolume = () => {
  const config = getConfig()

  if (!config) return

  getAllPlayers(config).then((players: TPlayers) => {
    players.forEach((player) => {
      const volume = localStorage.getItem(`player-${player.id}-volume`)
      if (volume) {
        setVolumePlayer(config, player.id, parseFloat(volume))
      }
    })
  })
}

export const muteAllPlayers = () => {
  const config = getConfig()

  if (!config) return

  getAllPlayers(config).then((players: TPlayers) => {
    players.forEach((player) => {
      setMutedPlayer(config, player.id, true)
    })
  })
}

export const unmuteAllPlayers = () => {
  const config = getConfig()

  if (!config) return

  getAllPlayers(config).then((players: TPlayers) => {
    players.forEach((player) => {
      setMutedPlayer(config, player.id, false)
    })
  })
}

export const enableSpeedometers = () => {
  const config = getConfig()

  if (!config) return

  getAllPlayers(config).then((data: TPlayers) => {
    for (const window of data) {
      if (window.driverData !== null) {
        setSpeedometerVisibility(config, parseInt(window.id), true)
      }
    }
  })
}
