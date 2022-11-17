const { ipcRenderer } = require("electron");

const debug = false;

let host;
let port;
let dynamicTextColor;
let defaultTextColor;
let defaultBackgroundColor;
let transparent = false;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.pitinfo;
    const networkConfig = (await ipcRenderer.invoke("get_config")).current
        .network;
    dynamicTextColor = config.dynamic_text_color;
    defaultTextColor = config.default_text_color;
    defaultBackgroundColor = config.default_background_color;
    host = networkConfig.host;
    port = networkConfig.port;
    if (debug) {
        console.log(dynamicTextColor);
        console.log(defaultTextColor);
        console.log(defaultBackgroundColor);
    }
    if (dynamicTextColor == false && defaultTextColor != "white") {
        let lines = document.querySelectorAll(".line");
        let heads = document.querySelectorAll("h1");
        for (i in lines) {
            lines[i].className = `line ${defaultTextColor}-background`;
        }
        for (i in heads) {
            heads[i].className = `${defaultTextColor}-text`;
        }
    } else {
        let lines = document.querySelectorAll(".line");
        let heads = document.querySelectorAll("h1");
        for (i in lines) {
            lines[i].className = `line`;
        }
        for (i in heads) {
            heads[i].className = ``;
        }
    }
    if (defaultBackgroundColor == "transparent") {
        document.getElementById("background").style.backgroundColor = "gray";
        document.getElementById("background").className = "transparent";
        transparent = true;
    } else {
        document.getElementById("background").style.backgroundColor =
            defaultBackgroundColor;
    }
}

function toggleBackground() {
    if (transparent) {
        document.getElementById("background").className = "";
        transparent = false;
    } else {
        document.getElementById("background").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

let driverList;
let timingData;
let timingAppData;
let pitLaneTimeCollection;
async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query LiveTimingState {
                        liveTimingState {
                          TimingData
                          TimingAppData
                          DriverList
                          PitLaneTimeCollection
                        }
                      }`,
                    operationName: "LiveTimingState",
                }),
                method: "POST",
            })
        ).json()
    ).data.liveTimingState;
    driverList = api.DriverList;
    timingData = api.TimingData.Lines;
    timingAppData = api.TimingAppData.Lines;
    pitLaneTimeCollection = api.PitLaneTimeCollection.PitTimes;
}

async function showAllDriver() {}

async function run() {
    await getConfigurations();
    await apiRequests();
    console.log(pitLaneTimeCollection);
}

run();
