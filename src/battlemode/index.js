const debug = false;

// The duration of the sector times being show when completing a sector
// (All times are in MS)
const holdSectorTimeDuration = 4000;
const holdEndOfLapDuration = 4000;
const loopspeed = 80;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Apply any configuration from the config.json file
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

// Toggle the background transparent or not
let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "";
        transparent = false;
    } else {
        document.querySelector("body").className = "transparent";
        transparent = true;
    }
}

// Listen to the escape key and toggle the backgrounds transparency when it is pressed
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

// All the api requests
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };

    const liveTimingClock = await f1mvApi.LiveTimingClockAPIGraphQL(config, ["trackTime", "systemTime", "paused"]);

    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "DriverList",
        "TimingAppData",
        "TimingData",
        "TimingStats",
        "SessionInfo",
        "TopThree",
        "SessionStatus",
    ]);

    driverList = liveTimingState.DriverList;
    tireData = liveTimingState.TimingAppData.Lines;
    timingData = liveTimingState.TimingData.Lines;
    qualiTimingData = liveTimingState.TimingData;
    bestTimes = liveTimingState.TimingStats.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    topThree = liveTimingState.TopThree.Lines;
    sessionStatus = liveTimingState.SessionStatus.Status;

    clockData = liveTimingClock;
}

async function run() {
    await getConfigurations();
    while (true) {
        await sleep(80);
    }
}
run();
