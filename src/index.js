const { app, BrowserWindow, ipcMain } = require("electron");
const { url } = require("inspector");
const path = require("path");

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 800,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "main/index.html"));
    mainWindow.setMenuBarVisibility(false);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle(
    "window",
    async (
        event,
        pathToHTML,
        width,
        height,
        frame,
        hideMenuBar,
        transparent,
        hasShadow
    ) => {
        const newWindow = new BrowserWindow({
            autoHideMenuBar: true,
            width: width,
            height: height,
            frame,
            hideMenuBar,
            transparent,
            hasShadow,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        newWindow.loadFile(path.join(__dirname, pathToHTML));
        return "Opening: " + pathToHTML;
    }
);
