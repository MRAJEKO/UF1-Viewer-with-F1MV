// Create all needed variables
const { app, BrowserWindow, ipcMain, screen, session } = require("electron");
const path = require("path");
const Store = require("electron-store");

const fetch = require("electron-fetch").default;

const f1mvApi = require("npm_f1mv_api");

require("electron-reload")(__dirname);

const defaults = {
  config: {
    general: { always_on_top: true, discord_rpc: true, await_session: true, highlighted_drivers: "" },
    network: { host: "localhost" },
    flag_display: { govee: false },
    session_log: {
      lapped_drivers: true,
      retired_drivers: true,
      rain: true,
      team_radios: false,
      pitstops: true,
      practice_starts: true,
      finished: true,
    },
    trackinfo: { orientation: "vertical" },
    singlercm: { display_duration: "10000" },
    current_laps: {
      always_on_top: true,
      show_header: true,
      sector_display_duration: "4000",
      end_display_duration: "4000",
    },
    weather: { datapoints: "30", use_trackmap_rotation: true },
    autoswitcher: { main_window_name: "INTERNATIONAL", speedometer: true, fixed_drivers: "" },
  },
  layouts: {},
  led_colors: {
    default: [255, 255, 255],
    white: [255, 255, 255],
    green: [0, 175, 0],
    yellow: [255, 230, 0],
    red: [209, 0, 0],
    purple: [185, 0, 185],
    black: [0, 0, 0],
  },
  team_icons: {
    Mercedes: "../icons/teams/mercedes.png",

    "Red Bull Racing": "../icons/teams/red-bull.png",

    McLaren: "../icons/teams/mclaren-white.png",

    "Force India": "../icons/teams/force-india.png",
    "Racing Point": "../icons/teams/racing-point.png",
    "Aston Martin": "../icons/teams/aston-martin.png",

    Williams: "../icons/teams/williams-white.png",

    "Toro Rosso": "../icons/teams/toro-rosso.png",
    AlphaTauri: "../icons/teams/alpha-tauri.png",

    Renault: "../icons/teams/renault.png",
    Alpine: "../icons/teams/alpine.png",

    Ferrari: "../icons/teams/ferrari.png",
    "Haas F1 Team": "../icons/teams/haas-red.png",

    Sauber: "../icons/teams/alfa-romeo.png",
    "Alfa Romeo Racing": "../icons/teams/alfa-romeo.png",
    "Alfa Romeo": "../icons/teams/alfa-romeo.png",
  },
  internal_settings: {
    windows: {
      main: {
        path: "main/index.html",
        autoHideMenuBar: true,
        width: 600,
        height: 1000,
        minWidth: 600,
        minHeight: 600,
        maximizable: false,
        icon: "icons/windows/logo.png",
      },
      flag_display: {
        path: "flagdisplay/index.html",
        width: 800,
        height: 600,
        frame: false,
        hideMenuBar: true,
        transparent: false,
        hasShadow: false,
        alwaysOnTop: false,
        aspectRatio: null,
        icon: "icons/windows/flagdisplay.png",
      },
      tracktime: {
        path: "tracktime/index.html",
        width: 400,
        height: 140,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/tracktime.png",
      },
      session_log: {
        path: "sessionlog/index.html",
        width: 250,
        height: 800,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/sessionlog.png",
      },
      trackinfo: {
        path: "trackinfo/index.html",
        width: null,
        height: null,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/trackinfo.png",
      },
      statuses: {
        path: "statuses/index.html",
        width: 250,
        height: 800,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/statuses.png",
      },
      singlercm: {
        path: "singlercm/index.html",
        width: 1000,
        height: 100,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: true,
        aspectRatio: null,
        icon: "icons/windows/singlercm.png",
      },
      crashdetection: {
        path: "crashdetection/index.html",
        width: 400,
        height: 400,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/crashdetection.png",
      },
      compass: {
        path: "compass/index.html",
        width: 250,
        height: 250,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: 1,
        icon: "icons/windows/compass.png",
      },
      tirestats: {
        path: "tirestats/index.html",
        width: 650,
        height: 600,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/tirestats.png",
      },
      current_laps: {
        path: "currentlaps/index.html",
        width: 300,
        height: 500,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/currentlaps.png",
      },
      battlemode: {
        path: "battlemode/index.html",
        width: 1300,
        height: 200,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/battlemode.png",
      },
      weather: {
        path: "weather/index.html",
        width: 1000,
        height: 530,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: null,
        aspectRatio: null,
        icon: "icons/windows/weather.png",
      },
      autoswitcher: {
        path: "autoswitch/index.html",
        width: 400,
        height: 480,
        frame: false,
        hideMenuBar: true,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: true,
        aspectRatio: null,
        icon: "icons/windows/autoswitcher.png",
      },
    },
    session: {
      getLiveSession: "https://api.jstt.me/api/v2/f1tv/live-session?joost.systems",
    },
    multiviewer: {
      app: {
        link: "muvi://",
      },
      livetiming: {
        link: "multiviewer://app/live-timing",
      },
    },
    analytics: {
      getUniqueID: "https://api.jstt.me/api/v2/uf1/analytics/active-users/getUniqueID",
      sendActiveUsers: "https://api.jstt.me/api/v2/uf1/analytics/active-users/post",
    },
  },
};

const store = new Store({
  migrations: {
    "1.4.4": (store) => {
      store.delete("config.trackinfo.default_background_color");
      store.delete("config.statuses");
      store.delete("config.weather.default_background_color");

      store.set("config.general.highlighted_drivers", "");
      store.set("config.session_log.practice_starts", true);
      store.set("config.session_log.finished", true);
      store.set("config.singlercm.display_duration", "10000");
      store.set("config.current_laps.sector_display_duration", "4000");
      store.set("config.current_laps.end_display_duration", "4000");
      store.set("config.autoswitcher.fixed_drivers", "");
    },
    "1.4.5": (store) => {
      if (store.get("config.session_log.practice_starts") === null) {
        store.set("config.session_log.practice_starts", true);
      }

      if (store.get("config.session_log.finished") === undefined) {
        store.set("config.session_log.finished", true);
      }

      if (store.get("config.autoswitcher.fixed_drivers") === undefined) {
        store.set("config.autoswitcher.fixed_drivers", "");
      }

      store.set("config.current_laps.show_header", true);

      store.set("internal_settings", defaults.internal_settings);

      store.set("team_icons", defaults.team_icons);

      store.set("config.general.await_session", true);
    },
    "1.4.8": (store) => {
      store.set(
        "internal_settings.session.getLiveSession",
        "https://api.jstt.me/api/v2/f1tv/live-session?joost.systems"
      );
      store.set(
        "internal_settings.analytics.getUniqueID",
        "https://api.jstt.me/api/v2/uf1/analytics/active-users/getUniqueID"
      );
      store.set(
        "internal_settings.analytics.sendActiveUsers",
        "https://api.jstt.me/api/v2/uf1/analytics/active-users/post"
      );
    },
  },

  defaults: defaults,
});

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Get main display height
// Create the browser window.
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 600,
    height: 1000,
    minWidth: 600,
    minHeight: 600,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "icons/windows/logo.png"),
  });

  // Load main window (main/index.html)
  mainWindow.loadFile(path.join(__dirname, "main/index.html"));
  // Disable the menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => app.quit());
};

// Create the main window when the app is ready to launch
app.on("ready", () => {
  createWindow();
  session.defaultSession.clearCache();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Receive request on channel 'window' to create a new browserwindow from 'main/refer.js'
ipcMain.handle(
  "window",
  async (
    // Get all arguments for new window
    event,
    pathToHTML,
    width,
    height,
    frame,
    hideMenuBar,
    transparent,
    hasShadow,
    alwaysOnTop,
    aspectRatio,
    icon
  ) => {
    // Create the new window with all arguments

    console.log(pathToHTML);

    if (!alwaysOnTop) alwaysOnTop = store.get("config.general.always_on_top");

    const newWindow = new BrowserWindow({
      autoHideMenuBar: hideMenuBar,
      width: width,
      height: height,
      frame,
      hideMenuBar,
      transparent,
      hasShadow,
      alwaysOnTop,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: path.join(__dirname, icon),
    });

    if (aspectRatio) newWindow.setAspectRatio(aspectRatio);

    newWindow.loadFile(path.join(__dirname, pathToHTML));

    return "Opening: " + pathToHTML + alwaysOnTop;
  }
);

ipcMain.handle("checkGoveeWindowExistence", (event) => {
  const windows = BrowserWindow.getAllWindows();

  for (const window of windows) {
    const path = window.getURL().split("src")[1];
    if (path.split("/")[2].includes("govee")) {
      return true;
    }
  }

  return false;
});

ipcMain.handle(
  "generateSolidColoredWindow",
  async (
    // Get all arguments for new window
    event,
    backgroundColor
  ) => {
    // Create the new window with all arguments
    const newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      backgroundColor: backgroundColor,
      icon: path.join(__dirname, "icons/windows/color.png"),
    });

    newWindow.loadURL(`data:text/html;charset=utf-8,<body style="-webkit-app-region: drag;"></body>`);

    newWindow.title = "Solid Color Window";
  }
);

ipcMain.handle("saveLayout", async (event, layoutId) => {
  const browserwindows = BrowserWindow.getAllWindows().sort((a, b) => a.id - b.id);

  let formattedUf1Windows = [];
  for (const window of browserwindows) {
    console.log(window.title);
    if (window.id === 1) continue;

    if (window.title === "Auto Onboard Camera Switching") continue;

    let path;
    let icon;
    if (window.title === "Solid Color Window") {
      path = "color;" + window.getBackgroundColor();
      icon = "color.png";
    } else {
      path = window.getURL().split("src")[1];
      if (!path.split("/")[2].includes(".")) continue;
      icon = path.split("/")[1] + ".png";
    }

    let bounds = window.getBounds();
    const hideMenuBar = !window.isMenuBarVisible();
    const frame = !hideMenuBar;
    const transparent = window.getBackgroundColor() === "#FFFFFF" ? false : true;
    const hasShadow = window.hasShadow();
    const alwaysOnTop = window.isAlwaysOnTop();

    const activeDisplay = screen.getDisplayNearestPoint({
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    });

    let fullscreen = false;

    if (
      window.isFullScreen() ||
      (bounds.x <= activeDisplay.bounds.x &&
        bounds.y <= activeDisplay.bounds.y &&
        bounds.width >= activeDisplay.bounds.width &&
        bounds.height >= activeDisplay.bounds.height)
    ) {
      fullscreen = true;
      bounds = activeDisplay.bounds;
    } else {
      if (bounds.x < activeDisplay.bounds.x) {
        bounds.width -= activeDisplay.bounds.x - bounds.x;
        bounds.x = activeDisplay.bounds.x;
      }

      if (bounds.y < activeDisplay.bounds.y) {
        bounds.height -= activeDisplay.bounds.y - bounds.y;
        bounds.y = activeDisplay.bounds.y;
      }

      if (bounds.x + bounds.width > activeDisplay.bounds.x + activeDisplay.bounds.width) {
        bounds.width = activeDisplay.bounds.x + activeDisplay.bounds.width - bounds.x;
      }

      if (bounds.y + bounds.height > activeDisplay.bounds.y + activeDisplay.bounds.height)
        bounds.height = activeDisplay.bounds.y + activeDisplay.bounds.height - bounds.y;
    }

    formattedUf1Windows.push({
      path,
      bounds,
      hideMenuBar,
      frame,
      transparent,
      hasShadow,
      fullscreen,
      alwaysOnTop,
      icon,
    });
  }

  const configFile = store.get("config");
  const host = configFile.network.host;
  const port = (await f1mvApi.discoverF1MVInstances(host))?.port;

  const config = {
    host: host,
    port: port,
  };

  const f1mvWindows = await f1mvApi.getAllPlayers(config);

  let formattedMvWindows = [];
  for (const window of f1mvWindows) {
    const windowId = window.id;
    const bounds = await f1mvApi.getPlayerBounds(config, windowId);

    formattedMvWindows.push({
      title: window.streamData.title,
      bounds: bounds,
      driverData: window.driverData,
      alwaysOnTop: true,
      maintainAspectRatio: false,
    });
  }

  const layoutConfig = store.get("layouts");

  const layout = layoutConfig[layoutId];

  layout.uf1Windows = formattedUf1Windows;

  layout.mvWindows = formattedMvWindows;

  store.set("layouts", layoutConfig);
});

ipcMain.handle("restoreLayout", async (event, layoutId, liveSessionInfo, contentIdField) => {
  const layoutConfig = store.get("layouts");

  const layout = layoutConfig[layoutId];

  for (const window of layout.uf1Windows) {
    if (window.path.includes("color")) {
      const backgroundColor = window.path.split(";")[1];

      const newWindow = new BrowserWindow({
        width: window.bounds.width,
        height: window.bounds.height,
        x: window.bounds.x,
        y: window.bounds.y,
        frame: false,
        fullscreen: window.fullscreen,
        backgroundColor: backgroundColor,
        icon: path.join(__dirname, "icons/windows/color.png"),
      });

      newWindow.loadURL(`data:text/html;charset=utf-8,<body style="-webkit-app-region: drag;"></body>`);

      newWindow.setSize(window.bounds.width, window.bounds.height);

      newWindow.title = "Solid Color Window";
    } else {
      const newWindow = new BrowserWindow({
        autoHideMenuBar: window.hideMenuBar,
        width: window.bounds.width,
        height: window.bounds.height,
        x: window.bounds.x,
        y: window.bounds.y,
        frame: window.frame,
        hideMenuBar: window.hideMenuBar,
        transparent: window.transparent,
        hasShadow: window.hasShadow,
        fullscreen: window.fullscreen,
        alwaysOnTop: window.alwaysOnTop,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
          nodeIntegration: true,
          contextIsolation: false,
        },
        icon: path.join(__dirname, "icons/windows/" + window.icon),
      });

      console.log(__dirname + window.path);

      await newWindow.loadFile(__dirname + window.path);

      newWindow.setSize(window.bounds.width, window.bounds.height);
    }

    await sleep(1000);
  }

  const configFile = store.get("config");
  const host = configFile.network.host;
  const port = (await f1mvApi.discoverF1MVInstances(host)).port;

  const config = {
    host: host,
    port: port,
  };

  let liveSessionType = liveSessionInfo?.sessionInfo?.sessionType?.toLowerCase() ?? null;

  if (!liveSessionInfo?.liveSessionFound && !contentIdField) return;

  if (liveSessionType?.includes("post") && !contentIdField) return;

  const driverList = (await f1mvApi.LiveTimingAPIGraphQL(config, "DriverList")).DriverList;

  let tempWindows = [];
  if (liveSessionType?.includes("pre") && !contentIdField) {
    if (!store.get("config.general.await_session")) return;

    console.log("Waiting for session to go live...");
    for (const window of layout.mvWindows) {
      const newWindow = new BrowserWindow({
        width: window.bounds.width,
        height: window.bounds.height,
        x: window.bounds.x,
        y: window.bounds.y,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
      });

      newWindow.loadFile(__dirname + "/main/tempstream/index.html");

      const color = `#${driverList[window.driverData?.driverNumber]?.TeamColour ?? "FFFFFF"}`;

      await newWindow.webContents.executeJavaScript(
        `document.getElementById("title").textContent = '${window.title}';
                document.getElementById("title").style.color = '${color}';`
      );

      tempWindows.push(newWindow);
    }
  }

  while (liveSessionType?.includes("pre") && !contentIdField) {
    session.defaultSession.clearCache();

    const liveSessionApiLink = store.get("internal_settings.session.getLiveSession");

    try {
      liveSessionInfo = await (await fetch(liveSessionApiLink)).json();
      liveSessionType = liveSessionInfo?.sessionInfo?.sessionType?.toLowerCase() ?? null;
    } catch (error) {
      console.log(error);
    }

    await sleep(15000);
  }

  console.log("Session is live. Opening MultiViewer streams...");

  const contentId =
    contentIdField === "" && !(liveSessionType.includes("pre") || liveSessionType.includes("post"))
      ? liveSessionInfo?.contentInfo?.contentId ?? null
      : contentIdField || null;

  if (!contentId) return;

  await sleep(1000);

  if (tempWindows.length > 0) {
    for (const window of tempWindows) {
      window.close();
    }
  }

  for (const window of layout.mvWindows) {
    const driverNumber = window.driverData?.driverNumber ?? null;

    if (window.driverData && !Object.keys(driverList).includes(driverNumber ? driverNumber.toString() : null)) continue;

    await f1mvApi.createPlayer(
      config,
      window.driverData?.driverNumber ?? null,
      contentId,
      window.bounds,
      window.maintainAspectRatio,
      window.title,
      window.alwaysOnTop
    );

    await sleep(1000);
  }
});

ipcMain.handle("get_store", async (event, args) => {
  return store.store;
});

ipcMain.handle("write_store", async (event, type, value) => {
  store.set(type, value);
  return store.store;
});

ipcMain.handle("reset_store", async (event, type) => {
  const typeDefaults = defaults[type];
  store.delete(type);
  store.set(type, typeDefaults);
  return store.store;
});
