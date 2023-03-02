const fs = require("fs");
const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");

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
    const config = (await ipcRenderer.invoke("get_store")).config;
    alwaysOnTop = config.general.always_on_top;
    alwaysOnTopPush = config.current_laps.always_on_top;
}

setAlwaysOnTop();
setInterval(async () => {
    await setAlwaysOnTop();
}, 2000);

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
        "flagdisplay.png"
    );
}

let liveSession = false;
let multiViewerConnected = false;
function livetiming() {
    if (liveSession) {
        if (multiViewerConnected) {
            location = "multiviewer://app/live-timing";
        } else {
            if (navigator.appVersion.includes("Win") || navigator.appVersion.includes("Mac")) {
                location = "muvi://";

                const interval = setInterval(() => {
                    if (multiViewerConnected) {
                        location = "multiviewer://app/live-timing";
                        clearInterval(interval);
                    }
                }, 500);
            } else {
                location = "multiviewer://app/live-timing";
            }
        }
    }
}

function livetimingButton() {
    if (liveSession) {
        const liveTimingButtons = document.getElementsByClassName("livetiming");
        for (const button of liveTimingButtons) {
            button.classList.remove("disabled");
        }
    } else {
        const liveTimingButtons = document.getElementsByClassName("livetiming");
        for (const button of liveTimingButtons) {
            button.classList.add("disabled");
        }
    }
}

let liveSessionInfo = null;
function sessionLive() {
    async function checkApi() {
        try {
            const response = await (await fetch("https://api.joost.systems/api/v2/f1tv/live-session")).json();

            liveSession = response.liveSessionFound && response.sessionInfo?.Series === "FORMULA 1";

            liveSessionInfo = response;

            livetimingButton();
        } catch (error) {
            console.log(error);
        }
    }

    checkApi();
    setInterval(async () => {
        await checkApi();
    }, 15000);
}

sessionLive();

let userActiveID;
async function getUserActiveID() {
    (await fetch("https://api.joost.systems/api/v2/uf1/analytics/active-users/getUniqueID")).json().then((data) => {
        userActiveID = data.uniqueID;
        userActiveHandler(true);
    });
}
async function userActiveHandler(active) {
    if (active === false) {
        await sendUserActiveData(false);
    } else if (active === true) {
        await sendUserActiveData(true);
        setInterval(async function () {
            await sendUserActiveData(true);
        }, 15000);
    }
}

async function sendUserActiveData(active) {
    if (active === false) {
        const userActiveURL = "https://api.joost.systems/api/v2/uf1/analytics/active-users/post";
        const requestBody = {
            uniqueID: userActiveID,
            userActive: false,
        };
        await fetch(userActiveURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
    } else if (active === true) {
        const userActiveURL = "https://api.joost.systems/api/v2/uf1/analytics/active-users/post";
        const requestBody = {
            uniqueID: userActiveID,
            userActive: true,
        };
        await fetch(userActiveURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
    }
}

getUserActiveID();
window.addEventListener("beforeunload", async function (e) {
    await userActiveHandler(false);
});

async function generateSolidWindow(color) {
    await ipcRenderer.invoke("generateSolidColoredWindow", color);
}

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
        "tracktime.png"
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
        "sessionlog.png"
    );
}

async function trackInfo() {
    const width = (await ipcRenderer.invoke("get_store")).config.trackinfo.orientation === "horizontal" ? 900 : 250;

    const height = (await ipcRenderer.invoke("get_store")).config.trackinfo.orientation === "horizontal" ? 100 : 800;

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
        "trackinfo.png"
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
        "statuses.png"
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
        "singlercm.png"
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
        "crashdetection.png"
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
        "compass.png"
    );
}

async function tirestats() {
    await ipcRenderer.invoke(
        "window",
        "tirestats/index.html",
        650,
        600,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "tirestats.png"
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
        "currentlaps.png"
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
        "battlemode.png"
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
        "weather.png"
    );
}

async function saveLayout(layoutId) {
    await ipcRenderer.invoke("saveLayout", layoutId);
    tooltip("Layout saved!", "#83FF83");
}

async function restoreLayout(layoutId) {
    const contentIdField = document.getElementById("content-id-field").value;
    await ipcRenderer.invoke("restoreLayout", layoutId, liveSessionInfo, contentIdField);
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
function settings() {
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
        setTimeout(() => {
            document.getElementById("menu").className = "shown overflow";
        }, 700);
    }
}

async function saveSettings() {
    const config = (await ipcRenderer.invoke("get_store")).config;
    for (const category in config) {
        for (const setting in config[category]) {
            const settingElement = document.querySelector(`#${category} #${setting}`);

            let value = settingElement.value;

            if (settingElement.type === "checkbox") value = settingElement.checked;

            config[category][setting] = value;
        }
    }

    console.log(config);

    console.log(await ipcRenderer.invoke("write_store", "config", config));

    console.log("Saved settings");
}

async function setSettings() {
    const config = (await ipcRenderer.invoke("get_store")).config;
    console.log(config);
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
    const config = (await ipcRenderer.invoke("reset_store", "config")).config;
    for (const category in config) {
        for (const setting in config[category]) {
            const settingElement = document.querySelector(`#${category} #${setting}`);

            if (settingElement.type === "checkbox") settingElement.checked = config[category][setting];

            if (settingElement.classList.contains("selector")) settingElement.value = config[category][setting];

            if (settingElement.type === "text") settingElement.value = config[category][setting];
        }
    }
    saveSettings();
}

async function tooltip(text, color) {
    document.getElementById("tooltip").children[0].textContent = text;
    document.getElementById("tooltip").style.backgroundColor = color;
    document.getElementById("tooltip").classList.add("show");

    setTimeout(() => {
        document.getElementById("tooltip").classList.remove("show");
    }, 5000);
}

function popup(value, id) {
    document.querySelector("#popup #name").value = value;
    document.querySelector("#popup #name").name = id;
    document.getElementById("popup").classList.add("show");
}

async function confirm() {
    const id = document.querySelector("#popup #name").name;
    const name = document.querySelector("#popup #name").value;

    const layouts = (await ipcRenderer.invoke("get_store")).layouts;
    layouts[id].name = name;

    await ipcRenderer.invoke("write_store", "layouts", layouts);

    document.getElementById("popup").classList.remove("show");
    document.getElementById("layouts-container").innerHTML = "";
    showLayouts();
}

function cancel() {
    document.getElementById("popup").classList.remove("show");
}

async function remove() {
    const id = document.querySelector("#popup #name").name;

    const layouts = (await ipcRenderer.invoke("get_store")).layouts;
    delete layouts[id];

    await ipcRenderer.invoke("write_store", "layouts", layouts);

    document.getElementById("popup").classList.remove("show");
    document.getElementById("layouts-container").innerHTML = "";
    showLayouts();
}

async function editLayout(layoutId) {
    const layouts = (await ipcRenderer.invoke("get_store")).layouts;
    popup(layouts[layoutId].name, layoutId);
}

async function showLayouts() {
    const layouts = (await ipcRenderer.invoke("get_store")).layouts;

    for (const layout in layouts) {
        const layoutName = layouts[layout].name;
        document.getElementById("layouts-container").innerHTML += `<div class="layout">
    <button class="window edit" onclick="editLayout(${layout})"><img src="../icons/edit.png" alt="" /></button>
    <button class="window load" onclick="restoreLayout(${layout})">${layoutName}</button>
    <button class="window save" onclick="saveLayout(${layout})"><img src="../icons/save.png" alt="" /></button>
</div>`;
    }
}

showLayouts();

async function newLayout() {
    const layouts = (await ipcRenderer.invoke("get_store")).layouts;

    const newId =
        Object.keys(layouts).length > 0 ? parseInt(Object.keys(layouts)[Object.keys(layouts).length - 1]) + 1 : 0;

    layouts[newId] = { name: "New Layout", uf1Windows: [], mvWindows: [] };

    await ipcRenderer.invoke("write_store", "layouts", layouts);

    document.getElementById("layouts-container").innerHTML = "";
    showLayouts();
    tooltip("New layout created, press the save icon to save your current layout", "#83FF83");
}

// Link MV
async function isConnected(ignore) {
    const loopId = setInterval(async () => {
        if (ignore) {
            document.getElementById("connect").className = "animation";
            return;
        }
        const configFile = (await ipcRenderer.invoke("get_store")).config;

        const host = configFile.network.host;
        try {
            const port = (await f1mvApi.discoverF1MVInstances(host)).port;

            multiViewerConnected = true;

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

                clearInterval(loopId);
            } else {
                console.log("No live timing session found");
            }
        } catch (error) {
            console.log("No MultiViewer instance found");
        }
    }, 500);
}

isConnected();
