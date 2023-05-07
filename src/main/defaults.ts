const defaults = {
  config: {
    general: {
      name: 'General',
      settings: {
        discord_rpc: {
          title: 'Enable Discord RPC',
          description: "Enable to show that you're using MultiViewer on Discord.",
          type: 'switch',
          value: true
        },
        await_session: {
          title: 'Await Session On Load',
          description:
            'During the Pre-session, load a layout and wait for the main session to start to open the MultiViewer windows.',
          type: 'switch',
          value: true
        },
        highlighted_drivers: {
          title: 'Highlighted drivers',
          description: 'Comma separated list of drivers to highlight. Example: VER,LEC,HAM',
          type: 'text',
          value: ''
        }
      }
    },
    network: {
      name: 'Network',
      settings: {
        host: {
          title: 'Host',
          description: 'The host where the MultiViewer API is running on.',
          type: 'text',
          value: 'localhost'
        }
      }
    },
    flag_display: {
      name: 'Flag display',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        },
        govee: {
          title: 'Enable Govee Lights Integration',
          description: 'Connect to your Govee lights to show the track status.',
          type: 'switch',
          value: false
        }
      }
    },
    tracktime: {
      name: 'Delayed Track Time',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    session_log: {
      name: 'Session Log',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        },
        show_header: {
          title: 'Show header',
          description: 'Enable or disable the header at the top of the window.',
          type: 'switch',
          value: true
        },
        lapped_drivers: {
          title: 'Lapped drivers',
          description: 'Show when drivers are lapped.',
          type: 'switch',
          value: true
        },
        retired_drivers: {
          title: 'Retired drivers',
          description: 'Show when drivers are retired.',
          type: 'switch',
          value: true
        },
        rain: {
          title: 'Rain Status',
          description: 'Show when rainfall starts or stops.',
          type: 'switch',
          value: true
        },
        team_radios: {
          title: 'Team Radios',
          description: "Show when new team radio's are available.",
          type: 'switch',
          value: false
        },
        pitstops: {
          title: 'Pitstops',
          description: 'Show when drivers have completed a pitstop.',
          type: 'switch',
          value: true
        },
        practice_starts: {
          title: 'Practice Starts',
          description: 'Show when drivers are doing practice starts.',
          type: 'switch',
          value: true
        },
        finished: {
          title: 'Finish',
          description: 'Show when drivers have finished the session.',
          type: 'switch',
          value: true
        }
      }
    },
    trackinfo: {
      name: 'Track Info',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        },
        orientation: {
          title: 'Orientation',
          description: 'The orientation of the track info window.',
          type: 'select',
          value: 'vertical',
          options: [
            {
              value: 'horizontal',
              title: 'Horizontal'
            },
            {
              value: 'vertical',
              title: 'Vertical'
            }
          ]
        }
      }
    },
    sector_statuses: {
      name: 'Sector Statuses',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    singlercm: {
      name: 'Single Race Control Message',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: true
        },
        display_duration: {
          title: 'Display duration',
          description: 'The duration in milliseconds to show the message.',
          type: 'number',
          value: 10000
        }
      }
    },
    crash_detection: {
      name: 'Crash Detection',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    track_rotation_compass: {
      name: 'Track Rotation Compass',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    tire_statistics: {
      name: 'Tire Statistics',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    current_laps: {
      name: 'Current Push Laps',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        },
        show_header: {
          title: 'Show header',
          description: 'Enable or disable the header at the top of the window.',
          type: 'switch',
          value: true
        },
        sector_display_duration: {
          title: 'Sector Display Duration',
          description:
            'Set the duration of how long the sector time will stay shown before it continues counting (in milliseconds).',
          type: 'number',
          value: 4000
        },
        end_display_duration: {
          title: 'End Display Duration',
          description:
            'Set the duration of how long the graphic will stay shown before it disappears (in milliseconds).',
          type: 'number',
          value: 4000
        }
      }
    },
    battle_mode: {
      name: 'Battle Mode',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        }
      }
    },
    weather: {
      name: 'Weather Info',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: false
        },
        datapoints: {
          title: 'Default Datapoints',
          description: 'The amount of default datapoints that are shown.',
          type: 'number',
          value: 30
        },
        use_trackmap_rotation: {
          title: 'Relative Wind Direction',
          description: 'Show the wind direction relative to the track map rotation.',
          type: 'switch',
          value: true
        }
      }
    },
    autoswitcher: {
      name: 'Auto Onboard Camera Switcher',
      settings: {
        always_on_top: {
          title: 'Always on top',
          description: 'Keep this window always on top.',
          type: 'switch',
          value: true
        },
        main_window_name: {
          title: 'Default Stream',
          description: "The default stream that all OBC's will be synced to.",
          type: 'select',
          value: 'INTERNATIONAL',
          options: [
            {
              value: 'INTERNATIONAL',
              title: 'International'
            },
            {
              value: 'F1 LIVE',
              title: 'F1 Live'
            },
            {
              value: 'PIT LANE',
              title: 'Pit Lane'
            }
          ]
        },
        speedometer: {
          title: 'Speedometer',
          description: "Always enable the speedometer on the OBC's.",
          type: 'switch',
          value: false
        },
        fixed_drivers: {
          title: 'Fixed Drivers',
          description:
            'Comma separated list of drivers to keep on display always. Example: VER,LEC,HAM.',
          type: 'text',
          value: ''
        }
      }
    }
  },
  layouts: {},
  colors: {
    general: {
      default: '#0f0f0f',
      black: '#000000',
      white: '#ffffff',
      purple: '#b900b9',
      green: '#00AF00',
      red: '#d10000',
      yellow: '#ffe600',
      blue: '#2196f3'
    },
    leds: {
      default: [255, 255, 255],
      white: [255, 255, 255],
      green: [0, 175, 0],
      yellow: [255, 230, 0],
      red: [209, 0, 0],
      purple: [185, 0, 185],
      black: [0, 0, 0]
    }
  },
  team_icons: {
    Mercedes: '../icons/teams/mercedes.png',

    'Red Bull Racing': '../icons/teams/red-bull.png',

    McLaren: '../icons/teams/mclaren-white.png',

    'Force India': '../icons/teams/force-india.png',
    'Racing Point': '../icons/teams/racing-point.png',
    'Aston Martin': '../icons/teams/aston-martin.png',

    Williams: '../icons/teams/williams-white.png',

    'Toro Rosso': '../icons/teams/toro-rosso.png',
    AlphaTauri: '../icons/teams/alpha-tauri.png',

    Renault: '../icons/teams/renault.png',
    Alpine: '../icons/teams/alpine.png',

    Ferrari: '../icons/teams/ferrari.png',
    'Haas F1 Team': '../icons/teams/haas-red.png',

    Sauber: '../icons/teams/alfa-romeo.png',
    'Alfa Romeo Racing': '../icons/teams/alfa-romeo.png',
    'Alfa Romeo': '../icons/teams/alfa-romeo.png'
  },
  internal_settings: {
    windows: {
      main: {
        path: '',
        autoHideMenuBar: true,
        width: 600,
        height: 1000,
        minWidth: 600,
        minHeight: 600,
        maximizable: false,
        icon: 'icons/windows/logo.png'
      },
      flag_display: {
        path: 'flag_display',
        width: 800,
        height: 600,
        frame: false,
        hideMenuBar: true,
        transparent: false,
        hasShadow: false,
        alwaysOnTop: false,
        aspectRatio: null,
        icon: 'icons/windows/flagdisplay.png'
      },
      tracktime: {
        path: 'tracktime',
        width: 350,
        height: 100,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: 3.5,
        aspectRatio: null,
        icon: 'icons/windows/tracktime.png'
      },
      session_log: {
        path: 'session_log',
        width: 250,
        height: 800,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/sessionlog.png'
      },
      trackinfo: {
        path: 'trackinfo',
        width: null,
        height: null,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/trackinfo.png'
      },
      statuses: {
        path: 'statuses',
        width: 250,
        height: 800,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/statuses.png'
      },
      singlercm: {
        path: 'singlercm',
        width: 1000,
        height: 100,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: true,
        aspectRatio: null,
        icon: 'icons/windows/singlercm.png'
      },
      crashdetection: {
        path: 'crashdetection',
        width: 400,
        height: 400,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/crashdetection.png'
      },
      compass: {
        path: 'compass',
        width: 250,
        height: 250,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: 1,
        icon: 'icons/windows/compass.png'
      },
      tirestats: {
        path: 'tirestats',
        width: 650,
        height: 600,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/tirestats.png'
      },
      current_laps: {
        path: 'current_laps',
        width: 300,
        height: 500,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/currentlaps.png'
      },
      battlemode: {
        path: 'battlemode',
        width: 1300,
        height: 200,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/battlemode.png'
      },
      weather: {
        path: 'weather',
        width: 1000,
        height: 530,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/weather.png'
      },
      autoswitcher: {
        path: 'autoswitcher',
        width: 400,
        height: 480,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: true,
        aspectRatio: null,
        icon: 'icons/windows/autoswitcher.png'
      }
    },
    session: {
      getLiveSession: 'https://api.jstt.me/api/v2/f1tv/live-session'
    },
    multiviewer: {
      app: {
        link: 'muvi://'
      },
      livetiming: {
        link: 'multiviewer://app/live-timing'
      }
    },
    analytics: {
      getUniqueID: 'https://api.joost.systems/api/v2/uf1/analytics/active-users/getUniqueID',
      sendActiveUsers: 'https://api.joost.systems/api/v2/uf1/analytics/active-users/post'
    }
  }
}

export default defaults
