const { spawn, exec } = require("child_process");
const fs = require("fs");
const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_config")).current;
    host = configFile.network.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    config = {
        host: host,
        port: port,
    };
    rpc = configFile.general.discord_rpc;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

function launchMVF1() {
    if (navigator.appVersion.includes("Win") || navigator.appVersion.includes("Mac")) {
        location = "f1mv://";
    } else if (navigator.appVersion.includes("X11") || navigator.appVersion.includes("Linux")) {
        alert("Opening MultiViewer for Linux is not supported yet.");
    } else {
        alert("Cannot run MultiViewer because OS is unknown.");
    }
}

async function ignore() {
    document.getElementById("connect").className = "animation";
}

async function setAlwaysOnTop() {
    while (true) {
        const config = (await ipcRenderer.invoke("get_config")).current;
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
        "flag.ico"
    );
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
        "time.ico"
    );
}

async function trackInfo() {
    await ipcRenderer.invoke(
        "window",
        "trackinfo/index.html",
        250,
        800,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "info.ico"
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
        "checkmark.ico"
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
        "messages.ico"
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
        "crash.ico"
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

async function fastest() {
    await ipcRenderer.invoke(
        "window",
        "fastest/index.html",
        1000,
        300,
        false,
        true,
        true,
        false,
        alwaysOnTop,
        "currentlaps.ico"
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

async function autoSwitch() {
    await ipcRenderer.invoke("window", "autoswitch/index.html", 400, 480, false, true, true, false, alwaysOnTop);
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
    const config = (await ipcRenderer.invoke("get_config")).current;
    if (debug) console.log(config);
    for (index in config) {
        for (i in config[index]) {
            if (debug) {
                console.log(i);
                console.log(index);
                console.log(config[index]);
                console.log(config[index][i]);
                console.log(document.querySelector("#" + index + " " + "#" + i));
                console.log(document.querySelector("#" + index + " " + "#" + i).value);
                console.log(document.querySelector("#" + index + " " + "#" + i).checked);
                console.log(document.querySelector("#" + index + " " + "#" + i).type == "checkbox");
            }
            let value = document.querySelector("#" + index + " " + "#" + i).value;
            if (debug) console.log(value);
            if (document.querySelector("#" + index + " " + "#" + i).type == "checkbox") {
                if (debug) console.log("Checkbox");
                value = document.querySelector("#" + index + " " + "#" + i).checked;
            }
            await ipcRenderer.invoke("write_config", index, i, value);
        }
    }
}

async function setSettings() {
    const config = (await ipcRenderer.invoke("get_config")).current;
    if (debug) console.log(config);
    for (index in config) {
        for (i in config[index]) {
            if (debug) {
                console.log(i);
                console.log(config[index]);
                console.log(config[index][i]);
            }
            if (document.querySelector("#" + index + " " + "#" + i).type == "checkbox") {
                if (debug) {
                    console.log("Switch");
                    console.log(document.querySelector("#" + index + " " + "#" + i).checked);
                }
                document.querySelector("#" + index + " " + "#" + i).checked = config[index][i];
            }
            if (document.querySelector("#" + index + " " + "#" + i).classList.contains("selector")) {
                document.querySelector("#" + index + " " + "#" + i).value = config[index][i];
                if (debug) {
                    console.log((document.querySelector("#" + index + " " + "#" + i).value = config[index][i]));
                    console.log("Selector");
                }
            }
            if (document.querySelector("#" + index + " " + "#" + i).type == "text") {
                document.querySelector("#" + index + " " + "#" + i).value = config[index][i];
                if (debug) {
                    console.log((document.querySelector("#" + index + " " + "#" + i).value = config[index][i]));
                    console.log("Text");
                }
            }
        }
    }
}

setSettings();

async function restoreAll() {
    if (debug) console.log("Restoring all settings");
    const config = await ipcRenderer.invoke("get_config");
    const defaultConfig = config.default;
    const currentConfig = config.current;
    for (index in currentConfig) {
        for (i in currentConfig[index]) {
            if (debug) {
            }
            if (document.querySelector("#" + index + " " + "#" + i).type == "checkbox") {
                if (debug) {
                    console.log("Switch");
                }
                document.querySelector("#" + index + " " + "#" + i).checked = defaultConfig[index][i];
            }
            if (document.querySelector("#" + index + " " + "#" + i).classList.contains("selector")) {
                document.querySelector("#" + index + " " + "#" + i).value = defaultConfig[index][i];
                if (debug) {
                    console.log((document.querySelector("#" + index + " " + "#" + i).value = defaultConfig[index][i]));
                    console.log("Selector");
                }
            }
            if (document.querySelector("#" + index + " " + "#" + i).type == "text") {
                document.querySelector("#" + index + " " + "#" + i).value = defaultConfig[index][i];
                if (debug) {
                    console.log((document.querySelector("#" + index + " " + "#" + i).value = defaultConfig[index][i]));
                    console.log("Text");
                }
            }
        }
    }
    saveSettings();
}

// Link MV
async function isConnected() {
    try {
        await getConfigurations();
        const api = (
            await (
                await fetch(`http://${host}:${port}/api/graphql`, {
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        query: `query LiveTimingClock {
                            liveTimingClock {
                              liveTimingStartTime
                            }
                          }`,
                        operationName: "LiveTimingClock",
                    }),
                    method: "POST",
                })
            ).json()
        ).data.liveTimingClock;

        console.log(api);
        if (api == null) {
            document.getElementById("connect").className = "shown";
            document.getElementById("connect").classList.add("animation");
        } else {
            await getConfigurations();
            if (rpc) {
                require("./RPC.js");
            }
            document.getElementById("connect").className = "animation";
            document.getElementById("connection-icon").src = "../icons/checkmark.png";
        }
    } catch (error) {
        console.log(error);
        document.getElementById("connect").className = "shown";
        isConnected();
    }
}

isConnected();
