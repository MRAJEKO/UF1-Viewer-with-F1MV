import Colors from '@renderer/modules/Colors'

export const TrackStatusText = {
  '1': 'ALL CLEAR',
  '2': 'YELLOW FLAG',
  '3': 'UNKNOWN',
  '4': 'SC DEPLOYED',
  '5': 'RED FLAG',
  '6': 'VSC DEPLOYED',
  '7': 'VSC ENDING'
}

export const TrackStatusColors = {
  '1': Colors.green,
  '2': Colors.yellow,
  '3': Colors.gray,
  '4': Colors.yellow,
  '5': Colors.red,
  '6': Colors.yellow,
  '7': Colors.yellow
}

export const SectorStatusText = {
  TrackSurfaceSlippery: 'SLIPPERY'
}

export const SectorStatusColors = {
  TrackSurfaceSlippery: `repeating-linear-gradient(to right, ${Colors.red}, ${Colors.red} 10%, ${Colors.yellow} 10%, ${Colors.yellow} 20%)`,
  CLEAR: Colors.green,
  YELLOW: Colors.yellow,
  'DOUBLE YELLOW': Colors.orange
}
