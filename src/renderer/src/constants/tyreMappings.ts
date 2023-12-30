import Colors from '@renderer/modules/Colors'

export const compoundLetterMapping = {
  WET: 'W',
  INTERMEDIATE: 'I',
  HARD: 'H',
  MEDIUM: 'M',
  SOFT: 'S',
  SUPERHARD: 'S',
  SUPERSOFT: 'S',
  ULTRASOFT: 'U',
  HYPERSOFT: 'H',
  UNKNOWN: '?'
}

export const compoundColorMapping = {
  WET: Colors.blue,
  INTERMEDIATE: Colors.green,
  HARD: Colors.white,
  MEDIUM: Colors.yellow,
  SOFT: Colors.red,
  SUPERHARD: Colors.orange,
  SUPERSOFT: Colors.red,
  ULTRASOFT: Colors.purple,
  HYPERSOFT: Colors.pink,
  UNKNOWN: Colors.grey
}
