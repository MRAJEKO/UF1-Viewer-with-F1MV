export const f1TimeToMiliseconds = (time) => {
  if (!time) return 0

  const [seconds, minutes] = time
    .split(':')
    .reverse()
    .map((number) => parseInt(number))

  return (minutes * 60 + seconds) * 1000
}

export const timeToMiliseconds = (time) => {
  if (!time) return 0

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

  return `${hours}:${minutes}:${seconds}`
}

export const milisecondsToHoursMinutesTime = (ms: number) => {
  const date = new Date(ms)

  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`
}

export const milisecondsToDaysTime = (ms) => {
  const date = new Date(ms)

  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${days}:${hours}:${minutes}:${seconds}`
}

export const timestampToMiliseconds = (timezone) => {
  if (!timezone.endsWith('Z')) timezone += 'Z'
  const [hours, minutes, seconds] = timezone
    .split('T')[1]
    .split(':')
    .map((number) => parseInt(number))

  return hours * 3600000 + minutes * 60000 + seconds * 1000
}

// A lap or sector time can be send through and will return as a number in seconds
export const parseLapOrSectorTime = (time?: string) => {
  if (!time) return 0

  // Split the input into 3 variables by checking if there is a : or a . in the time. Then replace any starting 0's by nothing and convert them to numbers using parseInt.
  const [minutes, seconds, milliseconds] = time
    .split(/[:.]/)
    .map((number) => parseInt(number.replace(/^0+/, '') || '0', 10))

  if (milliseconds === undefined) return minutes + seconds / 1000

  return minutes * 60 + seconds + milliseconds / 1000
}

export const milisecondsToF1 = (ms: number, fixedAmount: number) => {
  const minutes = Math.floor(ms / 60000)

  let milliseconds = ms % 60000

  const seconds =
    milliseconds / 1000 < 10 && minutes > 0
      ? '0' + (milliseconds / 1000).toFixed(fixedAmount)
      : (milliseconds / 1000).toFixed(fixedAmount)

  return minutes > 0 ? minutes + ':' + seconds : seconds
}
