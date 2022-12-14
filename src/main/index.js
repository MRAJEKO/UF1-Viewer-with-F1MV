const { spawn, exec } = require("child_process");
const fs = require("fs");
const { ipcRenderer } = require("electron");

const debug = false;

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let host;
let port;
let rpc;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current;
    host = config.network.host;
    port = config.network.port;
    rpc = config.general.discord_rpc;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

function launchMVF1() {
    let LOCALAPPDATA = process.env.LOCALAPPDATA;
    if (navigator.appVersion.indexOf("Win") != -1) {
        if (!fs.existsSync(`${LOCALAPPDATA}\\MultiViewerForF1`)) {
            alert(
                "Cannot run MultiViewer because of invalid path. Please put your MultiViewer folder under '%APPDATA%'"
            );
            return;
        }
        let mvPath = `${LOCALAPPDATA}\\MultiViewerForF1\\MultiViewer for F1.exe`;
        console.log("Launching MultiViewer");
        spawn(mvPath, [], { detached: true });
    } else if (navigator.appVersion.indexOf("Mac") != -1) {
        // alert("Launching MultiViewer is not compatible with MacOS yet.");
        if (!fs.existsSync(`/Applications/MultiViewer for F1.app`)) {
            alert(
                "Cannot run MultiViewer because of invalid path. Please put your MultiViewer folder under '/Applications'"
            );
            return;
        }
        let mvPath =
            "/Applications/MultiViewer for F1.app/Contents/MacOS/MultiViewer for F1";
        console.log("Launching MultiViewer");
        spawn("open", [mvPath], { detached: true });
    } else if (navigator.appVersion.indexOf("X11") != -1) {
        alert("Launching MultiViewer is not compatible with Unix OS yet.");
    } else if (navigator.appVersion.indexOf("Linux") != -1) {
        alert("Launching MultiViewer is not compatible with Linux OS yet.");
    } else {
        {
            alert("Cannot run MultiViewer because OS is unknown.");
        }
    }
}

let alwaysOnTop;
let alwaysOnTopImprovements;
async function setAlwaysOnTop() {
    while (true) {
        const config = (await ipcRenderer.invoke("get_config")).current;
        alwaysOnTop = config.general.always_on_top;
        alwaysOnTopImprovements =
            config.improvements.always_on_top_improvements;
        if (debug) {
            console.log(alwaysOnTop);
            console.log(alwaysOnTopImprovements);
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
        false
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
        alwaysOnTop
    );
}

async function trackInfo() {
    await ipcRenderer.invoke(
        "window",
        "trackinfo/index.html",
        1000,
        800,
        false,
        true,
        true,
        false,
        false
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
        alwaysOnTop
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
        alwaysOnTop
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
        alwaysOnTop
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
        alwaysOnTop
    );
}

async function improves() {
    await ipcRenderer.invoke(
        "window",
        "improves/index.html",
        300,
        500,
        false,
        true,
        true,
        false,
        alwaysOnTopImprovements
    );
}

async function autoSwitch() {
    await ipcRenderer.invoke(
        "window",
        "autoswitch/index.html",
        400,
        600,
        false,
        true,
        true,
        false,
        alwaysOnTop
    );
}

// Settings
let rotated = false;
async function settings() {
    if (rotated) {
        rotated = false;
        document.getElementById("settings-icon").style.transform =
            "rotate(-45deg)";
        document.getElementById("menu").className = "";
        document.getElementById("reset-defaults").classList.remove("show");
        saveSettings();
    } else {
        rotated = true;
        document.getElementById("settings-icon").style.transform =
            "rotate(45deg)";
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
            console.log(i);
            if (debug) {
                console.log(i);
                console.log(index);
                console.log(config[index]);
                console.log(config[index][i]);
                console.log(document.getElementById(i));
                console.log(document.getElementById(i).value);
                console.log(document.getElementById(i).checked);
                console.log(document.getElementById(i).type == "checkbox");
            }
            let value = document.getElementById(i).value;
            if (debug) console.log(value);
            if (document.getElementById(i).type == "checkbox") {
                if (debug) console.log("Checkbox");
                value = document.getElementById(i).checked;
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
            console.log(i);
            if (debug) {
                console.log(i);
                console.log(config[index]);
                console.log(config[index][i]);
                console.log(document.getElementById(i));
            }
            if (document.getElementById(i).type == "checkbox") {
                if (debug) {
                    console.log("Switch");
                    console.log(document.getElementById(i).checked);
                }
                document.getElementById(i).checked = config[index][i];
            }
            if (document.getElementById(i).classList.contains("selector")) {
                document.getElementById(i).value = config[index][i];
                if (debug) {
                    console.log(
                        (document.getElementById(i).value = config[index][i])
                    );
                    console.log("Selector");
                }
            }
            if (document.getElementById(i).type == "text") {
                document.getElementById(i).value = config[index][i];
                if (debug) {
                    console.log(
                        (document.getElementById(i).value = config[index][i])
                    );
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
            if (document.getElementById(i).type == "checkbox") {
                if (debug) {
                    console.log("Switch");
                }
                document.getElementById(i).checked = defaultConfig[index][i];
            }
            if (document.getElementById(i).classList.contains("selector")) {
                document.getElementById(i).value = defaultConfig[index][i];
                if (debug) {
                    console.log(
                        (document.getElementById(i).value =
                            defaultConfig[index][i])
                    );
                    console.log("Selector");
                }
            }
            if (document.getElementById(i).type == "text") {
                document.getElementById(i).value = defaultConfig[index][i];
                if (debug) {
                    console.log(
                        (document.getElementById(i).value =
                            defaultConfig[index][i])
                    );
                    console.log("Text");
                }
            }
        }
    }
    saveSettings();
}

// Link MV
async function isSynced() {
    await getConfigurations();
    try {
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
            if (rpc) {
                require("./RPC.js");
            }
            document.getElementById("connect").className = "animation";
        }
    } catch (error) {
        console.log(error);
        document.getElementById("connect").className = "shown";
    }
}

isSynced();
