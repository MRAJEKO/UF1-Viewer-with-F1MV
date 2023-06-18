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

export const timezoneToMiliseconds = (timezone) => {
  if (!timezone.endsWith('Z')) timezone += 'Z'
  const [hours, minutes, seconds] = timezone
    .split('T')[1]
    .split(':')
    .map((number) => parseInt(number))

  return hours * 3600000 + minutes * 60000 + seconds * 1000
}