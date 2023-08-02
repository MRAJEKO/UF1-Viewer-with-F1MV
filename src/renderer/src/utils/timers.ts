import { timeToMiliseconds } from './convertTime'

export const calculateSessionTime = (
  now: number,
  trackTime: string,
  systemTime: string,
  paused: boolean,
  utc: string,
  remaining: string,
  extrapolating: boolean
) => {
  const duration = timeToMiliseconds(remaining)

  const timerStart = new Date(utc).getTime()

  const timer = extrapolating
    ? paused
      ? duration - (parseInt(trackTime) - timerStart) + 1000
      : duration - (now - (parseInt(systemTime) - parseInt(trackTime)) - timerStart) + 1000
    : duration

  return timer
}
