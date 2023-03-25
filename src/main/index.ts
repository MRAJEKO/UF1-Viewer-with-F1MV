import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'

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
      always_on_top: true,
      discord_rpc: true,
      await_session: true,
      highlighted_drivers: ''
    },
    network: { host: 'localhost' },
    flag_display: { govee: false },
    session_log: {
      lapped_drivers: true,
      retired_drivers: true,
      rain: true,
      team_radios: false,
      pitstops: true,
      practice_starts: true,
      finished: true
    },
    trackinfo: { orientation: 'vertical' },
    singlercm: { display_duration: '10000' },
    current_laps: {
      always_on_top: true,
      show_header: true,
      sector_display_duration: '4000',
      end_display_duration: '4000'
    },
    weather: { datapoints: '30', use_trackmap_rotation: true },
    autoswitcher: { main_window_name: 'INTERNATIONAL', speedometer: true, fixed_drivers: '' }
  },
  layouts: {},
  led_colors: {
    default: [255, 255, 255],
    white: [255, 255, 255],
    green: [0, 175, 0],
    yellow: [255, 230, 0],
    red: [209, 0, 0],
    purple: [185, 0, 185],
    black: [0, 0, 0]
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
        path: 'main/index.html',
        autoHideMenuBar: true,
        width: 600,
        height: 1000,
        minWidth: 600,
        minHeight: 600,
        maximizable: false,
        icon: 'icons/windows/logo.png'
      },
      flag_display: {
        path: 'flagdisplay/index.html',
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
        path: 'tracktime/index.html',
        width: 400,
        height: 140,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: 'icons/windows/tracktime.png'
      },
      session_log: {
        path: 'sessionlog/index.html',
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
        path: 'trackinfo/index.html',
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
        path: 'statuses/index.html',
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
        path: 'singlercm/index.html',
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
        path: 'crashdetection/index.html',
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
        path: 'compass/index.html',
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
        path: 'tirestats/index.html',
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
        path: 'currentlaps/index.html',
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
        path: 'battlemode/index.html',
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
        path: 'weather/index.html',
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
        path: 'autoswitch/index.html',
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
      getLiveSession: 'https://api.joost.systems/api/v2/f1tv/live-session'
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
    '2.0.0': (store) => {
      store.set('internal_settings.test', 'test')
    }
  },
  defaults: defaults
})

ipcMain.handle('get-store', () => store.store)

ipcMain.handle('open-window', (_event, window) => {
  console.log(window)
  const windowProperties = store.store.internal_settings.windows[window]

  console.log(windowProperties)

  // const newWindow = new BrowserWindow({
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
