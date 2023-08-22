import { app, shell, BrowserWindow, ipcMain, session, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { windowProperties } from './types'
import defaults from './defaults'
import { autoUpdater } from 'electron-updater'

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

const store = new Store({
  migrations: {
    '2.0.0': (store: any) => {
      const oldConfig: any = store.get('config')
      const newConfig = {
        general: {
          name: 'General',
          settings: {
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
        sessiontimer: defaults.config.tracktime,
        session_log: {
          name: 'Session Log',
          settings: {
            always_on_top: defaults.config.session_log.settings.always_on_top,
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
            keep_on_display: defaults.config.singlercm.settings.keep_on_display,
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
      store.set('colors', {
        general: defaults.colors.general,
        leds: oldLeds,
        sessionLogHexModifier: defaults.colors.sessionLogHexModifier
      })

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

      store.set('config.teamradios', defaults.config.teamradios)
    }
  },
  defaults: defaults
})

app.on('before-quit', () => {
  session.defaultSession.clearCache()
})

ipcMain.on('get-store', (event, key) => {
  event.returnValue = store.get(key)
})

ipcMain.handle('set-config', (_event, config) => {
  store.set('config', config)
})

const getSize = (windowProperties: windowProperties) => {
  const config = store.get('config')
  const internalSettings = store.get('internal_settings')
  switch (windowProperties.path) {
    case 'trackinfo':
      const index: number = config.trackinfo.settings.orientation.value === 'horizontal' ? 0 : 1
      return {
        width: internalSettings.windows.trackinfo.width[index],
        height: internalSettings.windows.trackinfo.height[index]
      }
  }

  return { width: windowProperties.width, height: windowProperties.height }
}

ipcMain.handle('open-window', (_event, window) => {
  const windowProperties: windowProperties = store.store.internal_settings.windows[window]

  const newWindow = new BrowserWindow({
    autoHideMenuBar: windowProperties.hideMenuBar,
    ...getSize(windowProperties),
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
    newWindow.loadURL(
      process.env['ELECTRON_RENDERER_URL'] + `#/${windowProperties.path}/moveMode=true`
    )
  } else {
    newWindow.loadFile(
      join(__dirname, `../renderer/index.html#/${windowProperties.path}/moveMode=true`)
    )
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

ipcMain.on('initialize-keybind', (event, keybind) => {
  console.log('Initialize keybind', keybind)
  globalShortcut.register(keybind, () => {
    event.sender.send('keybind-pressed')
  })
})

ipcMain.on('remove-keybind', (_event, keybind) => {
  console.log('Remove keybind', keybind)
  globalShortcut.unregister(keybind)
})

ipcMain.handle('checkForUpdates', () => {
  return autoUpdater.checkForUpdates()
})

ipcMain.handle('downloadUpdate', () => {
  return autoUpdater.downloadUpdate()
})

ipcMain.handle('quitAndInstall', () => {
  return autoUpdater.quitAndInstall()
})
