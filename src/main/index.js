const fs = require("fs");
const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function getConfigurations(host, port, file) {
    config = {
        host: host,
        port: port,
    };
    rpc = file.general.discord_rpc;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

function launchMVF1() {
    if (navigator.appVersion.includes("Win") || navigator.appVersion.includes("Mac")) {
        location = "muvi://";
    } else if (navigator.appVersion.includes("X11") || navigator.appVersion.includes("Linux")) {
        alert("Opening MultiViewer for Linux is not supported yet.");
    } else {
        alert("Cannot run MultiViewer because OS is unknown.");
    }
}

async function ignore() {
    isConnected(true);
}

async function setAlwaysOnTop() {
    while (true) {
        const config = require("../settings/config.json").current;
        alwaysOnTop = config.general.always_on_top;
        alwaysOnTopPush = config.current_laps.always_on_top;
        if (debug) {
            console.log(alwaysOnTop);
            console.log(alwaysOnTopPush);
        }
        await sleep(2000);
    }
}
setAlwaysOnTop();

async function flagDisplay() {
    await ipcRenderer.invoke(
        "window",
        "flagdisplay/index.html",
        800,
        600,
        false,
        true,
        false,
        false,
        false,
        "flagdisplay.ico"
    );
}

let liveSession = false;
function livetiming() {
    if (liveSession) {
        location = "multiviewer://app/livetiming";
    }
}

function livetimingButton() {
    if (liveSession) document.getElementById("livetiming-button").classList.remove("disabled");
    else document.getElementById("livetiming-button").classList.add("disabled");
}

async function sessionLive() {
    while (true) {
        const response = await (await fetch("https://api.joost.systems/api/v2/f1tv/live-session")).json();

        response.liveSessionFound ? (liveSession = true) : (liveSession = false);

        livetimingButton();

        await sleep(60000);
    }
}

sessionLive();

async function trackTime() {
    await ipcRenderer.invoke(
        "window",
        "tracktime/index.html",
        400,
        140,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "tracktime.ico"
    );
}

async function sessionLog() {
    await ipcRenderer.invoke(
        "window",
        "sessionlog/index.html",
        250,
        800,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "sessionlog.ico"
    );
}

async function trackInfo() {
    const width = require("../settings/config.json").current.trackinfo.orientation === "horizontal" ? 900 : 250;

    const height = require("../settings/config.json").current.trackinfo.orientation === "horizontal" ? 200 : 800;

    await ipcRenderer.invoke(
        "window",
        "trackinfo/index.html",
        width,
        height,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "trackinfo.ico"
    );
}

async function statuses() {
    await ipcRenderer.invoke(
        "window",
        "statuses/index.html",
        250,
        800,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "statuses.ico"
    );
}

async function singleRCM() {
    await ipcRenderer.invoke(
        "window",
        "singlercm/index.html",
        1000,
        100,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "singlercm.ico"
    );
}

async function crashDetection() {
    await ipcRenderer.invoke(
        "window",
        "crashdetection/index.html",
        400,
        400,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "crashdetection.ico"
    );
}

async function compass() {
    await ipcRenderer.invoke(
        "window",
        "compass/index.html",
        100,
        100,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "compass.ico"
    );
}

async function tirestats() {
    await ipcRenderer.invoke(
        "window",
        "tirestats/index.html",
        800,
        600,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "tirestats.ico"
    );
}

async function currentLaps() {
    await ipcRenderer.invoke(
        "window",
        "currentlaps/index.html",
        300,
        500,
        false,
        true,
        true,
        false,
        alwaysOnTopPush,
        "currentlaps.ico"
    );
}

async function battlemode() {
    await ipcRenderer.invoke(
        "window",
        "battlemode/index.html",
        1300,
        200,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "battlemode.ico"
    );
}

async function weather() {
    await ipcRenderer.invoke(
        "window",
        "weather/index.html",
        1000,
        530,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "weather.ico"
    );
}

async function saveLayout(layoutId) {
    await ipcRenderer.invoke("saveLayout", layoutId);
}

async function restoreLayout(layoutId) {
    await ipcRenderer.invoke("restoreLayout", layoutId);
}

async function autoSwitch() {
    await ipcRenderer.invoke("window", "autoswitch/index.html", 400, 480, false, true, true, false, true);
}

function openLayouts() {
    const element = document.getElementById("layout");

    element.classList.toggle("shown");
}

// Settings
let rotated = false;
async function settings() {
    if (rotated) {
        rotated = false;
        document.getElementById("settings-icon").style.transform = "rotate(-45deg)";
        document.getElementById("menu").className = "";
        document.getElementById("reset-defaults").classList.remove("show");
        saveSettings();
    } else {
        rotated = true;
        document.getElementById("settings-icon").style.transform = "rotate(45deg)";
        document.getElementById("menu").className = "shown";
        document.getElementById("reset-defaults").classList.add("show");
        await sleep(700);
        document.getElementById("menu").className = "shown overflow";
    }
}

async function saveSettings() {
    const config = require("../settings/config.json");
    for (const category in config.current) {
        for (const setting in config.current[category]) {
            const settingElement = document.querySelector(`#${category} #${setting}`);

            let value = settingElement.value;

            if (settingElement.type === "checkbox") value = settingElement.checked;

            config.current[category][setting] = value;

            console.log(config);
            const data = JSON.stringify(config);
            fs.writeFile(__dirname + "/../settings/config.json", data, (err) => {
                if (err) {
                    console.log("Error writing file", err);
                } else {
                    console.log("Successfully wrote file");
                }
            });
        }
    }
}

async function setSettings() {
    const config = require("../settings/config.json").current;
    for (const category in config) {
        for (const setting in config[category]) {
            const settingElement = document.querySelector(`#${category} #${setting}`);

            if (settingElement.type === "checkbox") settingElement.checked = config[category][setting];

            if (settingElement.classList.contains("selector")) settingElement.value = config[category][setting];

            if (settingElement.type === "text") settingElement.value = config[category][setting];
        }
    }
}

setSettings();

async function restoreAll() {
    if (debug) console.log("Restoring all settings");
    const config = require("../settings/config.json");
    const defaultConfig = config.default;
    const currentConfig = config.current;
    for (const category in currentConfig) {
        for (const setting in currentConfig[category]) {
            const settingElement = document.querySelector(`#${category} #${setting}`);

            if (settingElement.type === "checkbox") settingElement.checked = defaultConfig[category][setting];

            if (settingElement.classList.contains("selector")) settingElement.value = defaultConfig[category][setting];

            if (settingElement.type === "text") settingElement.value = defaultConfig[category][setting];
        }
    }
    saveSettings();
}

// Link MV
async function isConnected(ignore) {
    if (ignore) {
        document.getElementById("connect").className = "animation";
        return;
    }
    const configFile = require("../settings/config.json").current;
    console.log(configFile);
    const host = configFile.network.host;
    try {
        const port = (await f1mvApi.discoverF1MVInstances(host)).port;

        document.getElementById("mv-connection").textContent = "Connected to MultiViewer";
        document.getElementById("mv-connection").className = "green";

        await getConfigurations(host, port, configFile);

        if ((await f1mvApi.LiveTimingAPIGraphQL(config, "SessionInfo")) !== null) {
            if (rpc) {
                require("./RPC.js");
            }

            console.log("Connected to MultiViewer and live timing session found");

            document.getElementById("timing-connection").textContent = "Connected to Live Timing";
            document.getElementById("timing-connection").className = "green";

            document.getElementById("connect").className = "animation";
            document.getElementById("connection-icon").src = "../icons/checkmark.png";
        } else {
            console.log("No live timing session found");

            await sleep(500);
            isConnected();
        }
    } catch (error) {
        console.log("No MultiViewer instance found");

        await sleep(500);
        isConnected();
    }
}

isConnected();
