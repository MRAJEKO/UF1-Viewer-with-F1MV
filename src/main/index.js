const fs = require("fs");
const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");
const { get } = require("request");

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

async function launchMVF1() {
    const multiviewerLink = (await ipcRenderer.invoke("get_store")).internal_settings.multiviewer.app.link;

    if (navigator.appVersion.includes("Win") || navigator.appVersion.includes("Mac")) {
        location = multiviewerLink;
    } else if (navigator.appVersion.includes("X11") || navigator.appVersion.includes("Linux")) {
        alert("Opening MultiViewer for Linux is not supported yet.");
    } else {
        alert("Cannot run MultiViewer because OS is unknown.");
    }
}

async function ignore() {
    isConnected(true);
}

let liveSession = false;
let multiViewerConnected = false;
async function livetiming() {
    const multiviewerLinks = (await ipcRenderer.invoke("get_store")).internal_settings.multiviewer;

    if (liveSession) {
        if (multiViewerConnected) {
            location = multiviewerLinks.livetiming.link;
        } else {
            if (navigator.appVersion.includes("Win") || navigator.appVersion.includes("Mac")) {
                location = multiviewerLinks.app.link;

                const interval = setInterval(() => {
                    if (multiViewerConnected) {
                        location = multiviewerLinks.livetiming.link;
                        clearInterval(interval);
                    }
                }, 500);
            } else {
                location = multiviewerLinks.livetiming.link;
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
async function setSessionInfo() {
    const liveSessionApiLink = (await ipcRenderer.invoke("get_store")).internal_settings.session.getLiveSession;

    try {
        liveSessionInfo = await (await fetch(liveSessionApiLink)).json();
        console.log(liveSessionInfo);
    } catch (error) {
        console.log(error);
    }
}

setSessionInfo();
setInterval(async () => {
    await setSessionInfo();
}, 15000);

let userActiveID;
async function getUserActiveID() {
    const getUniqueIDLink = (await ipcRenderer.invoke("get_store")).internal_settings.analytics.getUniqueID;
    (await fetch(getUniqueIDLink)).json().then((data) => {
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
        const userActiveURL = (await ipcRenderer.invoke("get_store")).internal_settings.analytics.sendActiveUsers;
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
        const userActiveURL = (await ipcRenderer.invoke("get_store")).internal_settings.analytics.sendActiveUsers;
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

async function flagDisplay() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.flag_display));
}

async function trackTime() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.tracktime));
}

async function sessionLog() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.session_log));
}

async function trackInfo() {
    const settings = await ipcRenderer.invoke("get_store");

    const internalSettings = settings.internal_settings;

    const width = settings.config.trackinfo.orientation === "horizontal" ? 900 : 250;
    internalSettings.windows.trackinfo.width = width;

    const height = settings.config.trackinfo.orientation === "horizontal" ? 100 : 800;
    internalSettings.windows.trackinfo.height = height;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.trackinfo));
}

async function statuses() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.statuses));
}

async function singleRCM() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.singlercm));
}

async function crashDetection() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.crashdetection));
}

async function compass() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.compass));
}

async function tirestats() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.tirestats));
}

async function currentLaps() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    const alwaysOnTop = (await ipcRenderer.invoke("get_store")).config.current_laps.always_on_top;

    internalSettings.windows.current_laps.alwaysOnTop = alwaysOnTop;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.current_laps));
}

async function battlemode() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.battlemode));
}

async function weather() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.weather));
}

async function autoSwitch() {
    const internalSettings = (await ipcRenderer.invoke("get_store")).internal_settings;

    await ipcRenderer.invoke("window", ...Object.values(internalSettings.windows.autoswitcher));
}

function openLayouts() {
    const element = document.getElementById("layout");

    element.classList.toggle("shown");
}

async function saveLayout(layoutId) {
    await ipcRenderer.invoke("saveLayout", layoutId);
    tooltip("Layout saved!", "#83FF83D9");
}

async function restoreLayout(layoutId) {
    const contentIdField = document.getElementById("content-id-field").value;

    console.log(liveSessionInfo);

    await ipcRenderer.invoke("restoreLayout", layoutId, liveSessionInfo, contentIdField);

    tooltip("Layout Opened!", "#83EEFFD9");
}

// Settings
let rotated = false;
function settings() {
    const settingsIcon = document.getElementById("settings-icon");

    if (settingsIcon.style.transform === "none" || settingsIcon.style.transform === "") {
        settingsIcon.style.transform = "rotate(60deg)";
    } else {
        settingsIcon.style.transform = "none";
        saveSettings();
    }

    document.getElementById("reset-defaults").classList.toggle("hidden");

    document.getElementById("layout-icon").classList.toggle("hidden");

    document.getElementById("menu").classList.toggle("shown");
    document.getElementById("menu").classList.toggle("overflow");
}

async function saveSettings() {
    const config = (await ipcRenderer.invoke("get_store")).config;
    for (const category in config) {
        for (const setting in config[category]) {
            try {
                const settingElement = document.querySelector(`#${category} #${setting}`);

                let value = settingElement.value;

                if (settingElement.type === "checkbox") value = settingElement.checked;

                config[category][setting] = value;
            } catch (e) {
                console.log(e);
            }
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
            try {
                const settingElement = document.querySelector(`#${category} #${setting}`);

                if (settingElement.type === "checkbox") settingElement.checked = config[category][setting];

                if (settingElement.classList.contains("selector")) settingElement.value = config[category][setting];

                if (settingElement.type === "text") settingElement.value = config[category][setting];
            } catch (e) {
                console.log(e);
            }
        }
    }
}

setSettings();

async function restoreAll() {
    if (debug) console.log("Restoring all settings");
    const config = (await ipcRenderer.invoke("reset_store", "config")).config;
    for (const category in config) {
        for (const setting in config[category]) {
            try {
                const settingElement = document.querySelector(`#${category} #${setting}`);

                if (settingElement.type === "checkbox") settingElement.checked = config[category][setting];

                if (settingElement.classList.contains("selector")) settingElement.value = config[category][setting];

                if (settingElement.type === "text") settingElement.value = config[category][setting];
            } catch (e) {
                console.log(e);
            }
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

    tooltip("Layout removed!", "#FF8383D9");
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
                        <div onclick="editLayout(${layout})" class="part name">
                        <p>
                            ${layoutName}<span class="icon-container"><img src="../icons/edit.png" alt="" /></span>
                        </p>
                    </div>
                    <div onclick="restoreLayout(${layout})" class="part load">
                        <p>LOAD</p>
                    </div>
                    <div class="part save" onclick="saveLayout(${layout})">
                        <p>
                            <span class="icon-container"><img src="../icons/save.png" alt="" /></span>SAVE
                        </p>
                    </div>
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
    tooltip("New layout created, press the save icon to save your current layout", "#83FF83D9");
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

            document.getElementById("mv-connection").innerHTML = "MULTIVIEWER: <span>CONNECTED</span>";
            document.getElementById("mv-connection").className = "link connected";

            await getConfigurations(host, port, configFile);

            if ((await f1mvApi.LiveTimingAPIGraphQL(config, "SessionInfo")) !== null) {
                if (rpc) {
                    require("./RPC.js");
                }

                console.log("Connected to MultiViewer and live timing session found");

                document.getElementById("timing-connection").innerHTML = "LIVE TIMING: <span>CONNECTED</span>";
                document.getElementById("timing-connection").className = "link connected";

                document.getElementById("connect").className = "animation";

                const connectionInfo = document.getElementById("connection");

                connectionInfo.className = "connected";
                connectionInfo.textContent = "CONNECTED";

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
