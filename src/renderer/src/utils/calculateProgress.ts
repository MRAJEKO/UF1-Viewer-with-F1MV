import { ILapCount, ISessionStatusStatus } from '@renderer/types/LiveTimingStateTypes'
import { f1TimeToMiliseconds } from './convertTime'
import { hasSessionEnded } from './getSessionStatus'

export const calculateMaxPossibleLaps = (
  fastestLap: string | undefined,
  LapCount: ILapCount,
  SessionStatus: ISessionStatusStatus | undefined,
  sessionTimeMs: number | undefined
) => {
  const { CurrentLap, TotalLaps } = LapCount

  if (hasSessionEnded(SessionStatus)) return CurrentLap

  if (sessionTimeMs === 0) return CurrentLap + 1

  if (!fastestLap || !sessionTimeMs) return TotalLaps

  const fastestLapMs = f1TimeToMiliseconds(fastestLap)

  if (CurrentLap + Math.ceil(sessionTimeMs / fastestLapMs) > TotalLaps) return TotalLaps

  return CurrentLap + Math.ceil(sessionTimeMs / fastestLapMs)
}
