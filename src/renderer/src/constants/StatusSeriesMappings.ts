import colors from '@renderer/modules/Colors'

export const TrackStatusColors = {
  '1': colors.green,
  '2': colors.yellow,
  '4': colors.orange,
  '5': colors.red,
  '6': colors.orange,
  '7': colors.yellow
}

export const TrackStatusText = {
  '1': 'Green Flag',
  '2': 'Yellow Flag',
  '3': 'Unknown',
  '4': 'Safety Car',
  '5': 'Red Flag',
  '6': 'Virtual Safety Car',
  '7': 'Virtual Safety Car Ending'
}

export const StatusSeriesTitleMappings = {
  TrackStatus: 'Track Status',
  SessionStatus: 'Session Status'
}

export const StatusSeriesStatusMappings = {
  TrackStatus: {
    AllClear: TrackStatusText['1'],
    Yellow: TrackStatusText['2'],
    SCDeployed: TrackStatusText['4'],
    Red: TrackStatusText['5'],
    VSCDeployed: TrackStatusText['6'],
    VSCEnding: TrackStatusText['7']
  }
}

export const StatusSeriesColorMappings = {
  TrackStatus: {
    AllClear: TrackStatusColors['1'],
    Yellow: TrackStatusColors['2'],
    SCDeployed: TrackStatusColors['4'],
    Red: TrackStatusColors['5'],
    VSCDeployed: TrackStatusColors['6'],
    VSCEnding: TrackStatusColors['7']
  },
  SessionStatus: {
    Inactive: colors.white,
    Started: colors.green,
    Finished: colors.white,
    Finalised: colors.white,
    Ends: colors.white,
    Aborted: colors.red
  }
}
