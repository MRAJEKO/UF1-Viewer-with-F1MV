import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { windowProperties } from './types'

const logo = 'src/renderer/src/assets/icons/windows/logo.png'

function createWindow(): void {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 1000,
    minWidth: 600,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: logo,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    session.defaultSession.clearCache()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => app.quit())
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

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

const store = new Store({
  migrations: {
    '2.0.0': (store: any) => {
      const oldConfig: any = store.get('config')
      const newConfig = {
        general: {
          name: 'General',
          settings: {
            always_on_top: {
              title: 'Always on top',
              description: 'Enable to show some windows always on top.',
              type: 'switch',
              value: oldConfig.general.always_on_top
            },
            discord_rpc: {
              title: 'Enable Discord RPC',
              description: "Enable to show that you're using MultiViewer on Discord.",
              type: 'switch',
              value: oldConfig.general.discord_rpc
            },
            await_session: {
              title: 'Await Session On Load',
              description:
                'During the Pre-session, load a layout and wait for the main session to start to open the MultiViewer windows.',
              type: 'switch',
              value: oldConfig.general.await_session
            },
            highlighted_drivers: {
              title: 'Highlighted drivers',
              description: 'Comma separated list of drivers to highlight. Example: VER,LEC,HAM',
              type: 'text',
              value: oldConfig.general.highlighted_drivers
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
              value: oldConfig.network.host
            }
          }
        },
        flag_display: {
          name: 'Flag display',
          settings: {
            always_on_top: defaults.config.flag_display.settings.always_on_top,
            govee: {
              title: 'Enable Govee Lights Integration',
              description: 'Connect to your Govee lights to show the track status.',
              type: 'switch',
              value: oldConfig.flag_display.govee
            }
          }
        },
        tracktime: defaults.config.tracktime,
        session_log: {
          name: 'Session Log',
          settings: {
            always_on_top: defaults.config.session_log.settings.always_on_top,
            lapped_drivers: {
              title: 'Lapped drivers',
              description: 'Show when drivers are lapped.',
              type: 'switch',
              value: oldConfig.session_log.lapped_drivers
            },
            retired_drivers: {
              title: 'Retired drivers',
              description: 'Show when drivers are retired.',
              type: 'switch',
              value: oldConfig.session_log.retired_drivers
            },
            rain: {
              title: 'Rain Status',
              description: 'Show when rainfall starts or stops.',
              type: 'switch',
              value: oldConfig.session_log.rain
            },
            team_radios: {
              title: 'Team Radios',
              description: "Show when new team radio's are available.",
              type: 'switch',
              value: oldConfig.session_log.team_radios
            },
            pitstops: {
              title: 'Pitstops',
              description: 'Show when drivers have completed a pitstop.',
              type: 'switch',
              value: oldConfig.session_log.pitstops
            },
            practice_starts: {
              title: 'Practice Starts',
              description: 'Show when drivers are doing practice starts.',
              type: 'switch',
              value: oldConfig.session_log.practice_starts
            },
            finished: {
              title: 'Finish',
              description: 'Show when drivers have finished the session.',
              type: 'switch',
              value: oldConfig.session_log.finished
            }
          }
        },
        trackinfo: {
          name: 'Track Info',
          settings: {
            always_on_top: defaults.config.trackinfo.settings.always_on_top,
            orientation: {
              title: 'Orientation',
              description: 'The orientation of the track info window.',
              type: 'select',
              value: oldConfig.trackinfo.orientation,
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
        sector_statuses: defaults.config.sector_statuses,
        singlercm: {
          name: 'Single Race Control Message',
          settings: {
            always_on_top: defaults.config.singlercm.settings.always_on_top,
            display_duration: {
              title: 'Display duration',
              description: 'The duration in milliseconds to show the message.',
              type: 'number',
              value: parseInt(oldConfig.singlercm.display_duration)
            }
          }
        },
        crash_detection: defaults.config.crash_detection,
        track_rotation_compass: defaults.config.track_rotation_compass,
        tire_statistics: defaults.config.tire_statistics,
        current_laps: {
          name: 'Current Laps',
          settings: {
            always_on_top: {
              title: 'Set always on top',
              description: 'Put this window always on top.',
              type: 'switch',
              value: oldConfig.current_laps.always_on_top
            },
            show_header: {
              title: 'Show header',
              description: 'Enable or disable the header at the top of the window.',
              type: 'switch',
              value: oldConfig.current_laps.show_header
            },
            sector_display_duration: {
              title: 'Sector Display Duration',
              description:
                'Set the duration of how long the sector time will stay shown before it continues counting (in milliseconds).',
              type: 'number',
              value: parseInt(oldConfig.current_laps.sector_display_duration)
            },
            end_display_duration: {
              title: 'End Display Duration',
              description:
                'Set the duration of how long the graphic will stay shown before it disappears (in milliseconds).',
              type: 'number',
              value: parseInt(oldConfig.current_laps.end_display_duration)
            }
          }
        },
        battle_mode: defaults.config.battle_mode,
        weather: {
          name: 'Weather Info',
          settings: {
            always_on_top: defaults.config.weather.settings.always_on_top,
            datapoints: {
              title: 'Default Datapoints',
              description: 'The amount of default datapoints that are shown.',
              type: 'number',
              value: parseInt(oldConfig.weather.datapoints)
            },
            use_trackmap_rotation: {
              title: 'Relative Wind Direction',
              description: 'Show the wind direction relative to the track map rotation.',
              type: 'switch',
              value: oldConfig.weather.use_trackmap_rotation
            }
          }
        },
        autoswitcher: {
          name: 'Auto Onboard Camera Switcher',
          settings: {
            always_on_top: defaults.config.autoswitcher.settings.always_on_top,
            main_window_name: {
              title: 'Default Stream',
              description: "The default stream that all OBC's will be synced to.",
              type: 'select',
              value: oldConfig.autoswitcher.main_window_name,
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
              value: oldConfig.autoswitcher.speedometer
            },
            fixed_drivers: {
              title: 'Fixed Drivers',
              description:
                'Comma separated list of drivers to keep on display always. Example: VER,LEC,HAM.',
              type: 'text',
              value: oldConfig.autoswitcher.fixed_drivers
            }
          }
        }
      }

      store.set('config', newConfig)

      store.set('internal_settings', defaults.internal_settings)

      const oldLeds: any = store.get('led_colors')
      store.set('colors', { general: { ...defaults.colors.general }, leds: oldLeds })

      store.delete('led_colors')

      for (const windowSettingKey in store.get('internal_settings.windows')) {
        const windowSetting = store.get('internal_settings.windows')[windowSettingKey]

        if (windowSetting.hasOwnProperty('alwaysOnTop'))
          store.delete(`internal_settings.windows.${windowSettingKey}.alwaysOnTop`)
      }

      store.set(
        'internal_settings.session.getLiveSession',
        'https://api.jstt.me/api/v2/f1tv/live-session'
      )

      store.set('internal_settings.windows.tracktime.aspectRatio', 3.5)
    }
  },
  defaults: defaults
})

app.on('before-quit', () => {
  session.defaultSession.clearCache()
})

ipcMain.handle('get-store', () => store.store)

ipcMain.handle('set-config', (_event, config) => {
  store.set('config', config)
})

ipcMain.handle('open-window', (_event, window) => {
  const windowProperties: windowProperties = store.store.internal_settings.windows[window]

  const newWindow = new BrowserWindow({
    autoHideMenuBar: windowProperties.hideMenuBar,
    width: windowProperties.width,
    height: windowProperties.height,
    frame: windowProperties.frame,
    transparent: windowProperties.transparent,
    hasShadow: windowProperties.hasShadow,
    icon: `src/renderer/src/assets/${windowProperties.icon}`,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false
    }
  })

  if (windowProperties.aspectRatio) newWindow.setAspectRatio(windowProperties.aspectRatio)

  if (store.get(`config.${window}.settings.always_on_top.value`)) newWindow.setAlwaysOnTop(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], `/${windowProperties.path}`))
  } else {
    newWindow.loadFile(join(__dirname, `../renderer/index.html/${windowProperties.path}}`))
  }
})

ipcMain.handle('open-solid-window', (_event, color) => {
  const newWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: color,
    icon: 'src/renderer/src/assets/icons/windows/color.png'
  })

  newWindow.loadURL(`data:text/html;charset=utf-8,<body style="-webkit-app-region: drag;"></body>`)
})

ipcMain.handle('clear-cache', () => session.defaultSession.clearCache())
