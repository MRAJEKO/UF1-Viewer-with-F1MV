const { getAllPlayers, setMutedPlayer, setVolumePlayer } = window.mvApi

export interface IPlayer {
  id: string
  type: 'ADDITIONAL' | 'OBC'
  state: {
    ts: number
    paused: boolean
    muted: boolean
    volume: number
    live: boolean
    currentTime: number
    interpolatedCurrentTime: number
  }
  driverData: {
    driverNumber: number
    tla: string
    firstName: string
    lastName: string
    teamName: string
  }
  streamData: {
    contentId: number | string
    meetingKey: string
    sessionKey: string
    channelId: number
    title: string
  }
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  fullscreen: boolean
  alwaysOnTop: boolean
  maintainAspectRatio: boolean
}

export const reduceAllPlayersVolume = (reducePercentage: number) => {
  const configString = localStorage.getItem('config')

  if (!configString) return

  const config = JSON.parse(configString)

  getAllPlayers(config).then((players) => {
    players.forEach((player: IPlayer) => {
      if (!player.state.muted)
        if (player.state.volume) {
          localStorage.setItem(`player-${player.id}-volume`, player.state.volume.toString())

          setVolumePlayer(config, player.id, player.state.volume * (reducePercentage / 100))
        }
    })
  })
}

export const restoreAllPlayersVolume = () => {
  const configString = localStorage.getItem('config')

  if (!configString) return

  const config = JSON.parse(configString)

  getAllPlayers(config).then((players) => {
    players.forEach((player: IPlayer) => {
      const volume = localStorage.getItem(`player-${player.id}-volume`)
      if (volume) {
        setVolumePlayer(config, player.id, parseFloat(volume))
      }
    })
  })
}

export const muteAllPlayers = () => {
  const configString = localStorage.getItem('config')

  if (!configString) return

  const config = JSON.parse(configString)

  console.log(getAllPlayers)

  getAllPlayers(config).then((players) => {
    players.forEach((player: IPlayer) => {
      setMutedPlayer(config, player.id, true)
    })
  })
}

export const unmuteAllPlayers = () => {
  const configString = localStorage.getItem('config')

  if (!configString) return

  const config = JSON.parse(configString)

  getAllPlayers(config).then((players) => {
    players.forEach((player: IPlayer) => {
      setMutedPlayer(config, player.id, false)
    })
  })
}
