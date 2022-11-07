// Create all needed variables
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { url } = require("inspector");
const path = require("path");
const fs = require("fs");

// Get main display height
// Create the browser window.
const createWindow = () => {
    const mainDisplayHeight = screen.getPrimaryDisplay().size.height;
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 600,
        height: mainDisplayHeight,
        minWidth: 600,
        minHeight: 600,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
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
        alwaysOnTop
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
        });
        newWindow.loadFile(path.join(__dirname, pathToHTML));
        return "Opening: " + pathToHTML + alwaysOnTop;
    }
);

// Receive request on 'write_config' to write all the settings to 'config.json'
ipcMain.handle("write_config", async (event, category, key, value) => {
    const config = require("./config.json");
    config.current[category][key] = value;
    const data = JSON.stringify(config);
    // Write the data to 'config.json'
    fs.writeFile(__dirname + "/config.json", data, (err) => {
        if (err) {
            console.log("Error writing file", err);
        } else {
            console.log("Successfully wrote file");
        }
    });
    return require("./config.json");
});

// Receive request on 'get_config' to get all the current values inside of 'config.json'
ipcMain.handle("get_config", async (event, args) => {
    const config = require("./config.json");
    return config;
});
