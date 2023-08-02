interface ISessionLengths {
  [key: string]: {
    duration: null | number
    parts: null | number[]
    extraTime: null | number
  }
}

export const sessionLengths: ISessionLengths = {
  Race: {
    duration: 7200000,
    parts: null,
    extraTime: 3600000
  },
  Sprint: {
    duration: 3600000,
    parts: null,
    extraTime: 3600000
  },
  Qualifying: {
    duration: 3600000,
    parts: [1080000, 900000, 720000],
    extraTime: null
  },
  'Sprint Shootout': {
    duration: 2640000,
    parts: [720000, 600000, 480000],
    extraTime: null
  },
  Practice: {
    duration: 3600000,
    parts: null,
    extraTime: null
  }
}
