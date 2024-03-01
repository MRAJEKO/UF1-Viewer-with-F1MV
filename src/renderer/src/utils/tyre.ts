import wet from '@renderer/assets/icons/tires/wet.png'
import intermediate from '@renderer/assets/icons/tires/intermediate.png'
import hard from '@renderer/assets/icons/tires/hard.png'
import medium from '@renderer/assets/icons/tires/medium.png'
import soft from '@renderer/assets/icons/tires/soft.png'
import unknown from '@renderer/assets/icons/tires/unknown.png'
import test from '@renderer/assets/icons/tires/test.png'

export const getTyreIcon = (tyre: string | undefined) => {
  switch (tyre) {
    case 'WET':
      return wet
    case 'INTERMEDIATE':
      return intermediate
    case 'HARD':
      return hard
    case 'MEDIUM':
      return medium
    case 'SOFT':
      return soft
    case 'TEST':
    case 'TEST_UNKNOWN':
      return test
    default:
      return unknown
  }
}
