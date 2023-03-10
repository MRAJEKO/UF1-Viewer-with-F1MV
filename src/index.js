// Create all needed variables
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const Store = require("electron-store");

const f1mvApi = require("npm_f1mv_api");

require("electron-reload")(__dirname);

const defaults = {
    config: {
        general: { always_on_top: true, discord_rpc: true, highlighted_drivers: "" },
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
        current_laps: { always_on_top: true, sector_display_duration: "4000", end_display_duration: "4000" },
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
        "Red Bull Racing": "../icons/teams/red-bull.png",
        McLaren: "../icons/teams/mclaren-white.png",
        "Aston Martin": "../icons/teams/aston-martin.png",
        Williams: "../icons/teams/williams-white.png",
        AlphaTauri: "../icons/teams/alpha-tauri.png",
        Alpine: "../icons/teams/alpine.png",
        Ferrari: "../icons/teams/ferrari.png",
        "Haas F1 Team": "../icons/teams/haas-red.png",
        "Alfa Romeo": "../icons/teams/alfa-romeo.png",
        Mercedes: "../icons/teams/mercedes.png",
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
            if (store.get("config.session_log.practice_starts") === undefined) {
                store.set("config.session_log.practice_starts", true);
            }

            if (store.get("config.session_log.finished") === undefined) {
                store.set("config.session_log.finished", true);
            }

            if (store.get("config.autoswitcher.fixed_drivers") === undefined) {
                store.set("config.autoswitcher.fixed_drivers", "");
            }
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
    const mainDisplayHeight = screen.getPrimaryDisplay().size.height;
    let height = 1000;
    if (mainDisplayHeight < height) {
        height = mainDisplayHeight;
    }
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 600,
        height: height,
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
app.on("ready", createWindow);

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
        icon,
        aspectRatio
    ) => {
        // Create the new window with all arguments
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
            icon: path.join(__dirname, "icons/windows/" + icon),
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
        let newWindow = new BrowserWindow({
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

        if (
            window.isFullScreen() ||
            (bounds.x <= activeDisplay.bounds.x &&
                bounds.y <= activeDisplay.bounds.y &&
                bounds.width >= activeDisplay.bounds.width &&
                bounds.height >= activeDisplay.bounds.height)
        ) {
            fullscreen = true;
            bounds = activeDisplay.bounds;
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
        let newWindow;

        if (window.path.includes("color")) {
            const backgroundColor = window.path.split(";")[1];

            newWindow = new BrowserWindow({
                width: window.bounds.width,
                height: window.bounds.height,
                x: window.bounds.x,
                y: window.bounds.y,
                frame: false,
                fullscreen: window.fullscreen,
                backgroundColor: backgroundColor,
                icon: path.join(__dirname, "icons/windows/color.png"),
            });

            newWindow.setContentSize(window.bounds.width, window.bounds.height, true);

            newWindow.loadURL(`data:text/html;charset=utf-8,<body style="-webkit-app-region: drag;"></body>`);

            newWindow.title = "Solid Color Window";
        } else {
            newWindow = new BrowserWindow({
                autoHideMenuBar: window.hideMenuBar,
                width: window.bounds.width,
                height: window.bounds.height,
                x: window.bounds.x,
                y: window.bounds.y,
                frame: window.frame,
                hideMenuBar: window.hideMenuBar,
                useContentSize: true,
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

            newWindow.setContentSize(window.bounds.width, window.bounds.height, true);

            newWindow.loadFile(__dirname + window.path);
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

    const liveSessionType = liveSessionInfo?.sessionInfo?.sessionType?.toLowerCase() ?? null;

    const contentId =
        liveSessionInfo?.liveSessionFound &&
        liveSessionInfo?.sessionInfo?.Series === "FORMULA 1" &&
        (liveSessionType?.includes("post") || liveSessionType?.includes("pre"))
            ? liveSessionInfo?.contentInfo?.contentId
            : contentIdField ?? null;

    if (!contentId) return;

    await sleep(5000);

    const driverList = (await f1mvApi.LiveTimingAPIGraphQL(config, "DriverList")).DriverList;

    for (const window of layout.mvWindows) {
        const driverNumber = window.driverData?.driverNumber ?? null;
        if (window.driverData && !Object.keys(driverList).includes(driverNumber ? driverNumber.toString() : null))
            continue;

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

// Receive request on 'write_config' to write all the settings to 'config.json'
// ipcMain.handle("write_config", async (event, category, key, value) => {
//     const config = require("./config.json");
//     config.current[category][key] = value;
//     const data = JSON.stringify(config);
//     // Write the data to 'config.json'
//     fs.writeFile(__dirname + "/config.json", data, (err) => {
//         if (err) {
//             console.log("Error writing file", err);
//         } else {
//             console.log("Successfully wrote file");
//         }
//     });
//     return require("./config.json");
// });

// Receive request on 'get_config' to get all the current values inside of 'config.json'
// ipcMain.handle("get_config", async (event, args) => {
//     const config = require("./config.json");
//     return config;
// });

// Get the correct team icon from the team name
// ipcMain.handle("get_icon", async (event, teamName) => {
//     const icons = {
//         "Red Bull Racing": "../icons/teams/red-bull.png",
//         McLaren: "../icons/teams/mclaren-white.png",
//         "Aston Martin": "../icons/teams/aston-martin.png",
//         Williams: "../icons/teams/williams-white.png",
//         AlphaTauri: "../icons/teams/alpha-tauri.png",
//         Alpine: "../icons/teams/alpine.png",
//         Ferrari: "../icons/teams/ferrari.png",
//         "Haas F1 Team": "../icons/teams/haas-red.png",
//         "Alfa Romeo": "../icons/teams/alfa-romeo.png",
//         Mercedes: "../icons/teams/mercedes.png",
//     };

//     return icons[teamName];
// });
