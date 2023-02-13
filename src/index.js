// Create all needed variables
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const electron = require("electron");
const path = require("path");
const fs = require("fs");

require("electron-reload")(__dirname);

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
        icon: path.join(__dirname, "icons/windows/logo.ico"),
    });

    // Load main window (main/index.html)
    mainWindow.loadFile(path.join(__dirname, "main/index.html"));
    // Disable the menu bar
    mainWindow.setMenuBarVisibility(false);
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
        icon
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
        newWindow.loadFile(path.join(__dirname, pathToHTML));

        return "Opening: " + pathToHTML + alwaysOnTop;
    }
);

ipcMain.handle("saveLayout", (event, layoutId) => {
    const windows = BrowserWindow.getAllWindows().sort((a, b) => a.id - b.id);

    let formattedWindows = [];
    for (const window of windows) {
        if (window.id === 1) continue;
        const path = window.getURL().split("src")[1];
        if (!path.split("/")[2].includes(".")) continue;
        const bounds = window.getBounds();
        const hideMenuBar = !window.isMenuBarVisible();
        const frame = !hideMenuBar;
        const transparent = true;
        const hasShadow = window.hasShadow();
        const alwaysOnTop = window.isAlwaysOnTop();
        const icon = path.split("/")[1] + ".ico";

        formattedWindows.push({ path, bounds, hideMenuBar, frame, transparent, hasShadow, alwaysOnTop, icon });
    }

    console.log(formattedWindows);

    const layoutConfig = require("./settings/layout.json");

    const layout = layoutConfig[layoutId];

    layout.windows = formattedWindows;

    const data = JSON.stringify(layoutConfig);

    fs.writeFile(__dirname + "/settings/layout.json", data, (err) => {
        if (err) {
            console.log("Error saving layout", err);
        } else {
            console.log("Saved layout");
        }
    });

    // return ids;
});

ipcMain.handle("restoreLayout", (event, layoutId) => {
    const layoutConfig = require("./settings/layout.json");

    const layout = layoutConfig[layoutId];

    for (const window of layout.windows) {
        const newWindow = new BrowserWindow({
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
