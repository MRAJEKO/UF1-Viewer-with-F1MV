import Colors from '@renderer/modules/Colors'

export type ISessionStatusMapping = [
  'ONSCHEDULE' | 'DELAYED' | 'ONGOING' | 'FINISHED' | 'FINALISED' | 'SUSPENDED' | 'UNKNOWN',
  string,
  string?
]

export const getSessionStatus = (status: string, startDelayed: boolean): ISessionStatusMapping => {
  switch (status) {
    case 'Inactive':
      return startDelayed ? ['DELAYED', Colors.orange] : ['ONSCHEDULE', Colors.blue]
    case 'Started':
      return ['ONGOING', Colors.green]
    case 'Finished':
      return ['FINISHED', Colors.white]
    case 'Finalised':
    case 'Ends':
      return ['FINALISED', Colors.gray, Colors.black]
    case 'Aborted':
      return ['SUSPENDED', Colors.red]
    default:
      return ['UNKNOWN', Colors.white]
  }
}
