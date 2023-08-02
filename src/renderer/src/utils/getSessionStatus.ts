import { ISessionStatusStatus } from '@renderer/types/LiveTimingStateTypes'

export const hasSessionEnded = (sessionStatus: ISessionStatusStatus | undefined) =>
  sessionStatus ? ['Finished', 'Ends', 'Finalised'].includes(sessionStatus) : false
