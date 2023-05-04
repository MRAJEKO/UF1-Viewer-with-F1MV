export const timeToMiliseconds = (time) => {
  const [seconds, minutes, hours] = time
    .split(':')
    .reverse()
    .map((number) => parseInt(number))

  if (hours === undefined) return (minutes * 60 + seconds) * 1000

  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

export const milisecondsToTime = (ms) => {
  const date = new Date(ms)

  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  if (parseInt(hours) === 0) {
    return `${minutes}:${seconds}`
  }

  return `${hours}:${minutes}:${seconds}`
}

export const milisecondsToDaysTime = (ms) => {
  const date = new Date(ms)

  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${days}:${hours}:${minutes}:${seconds}`
}
