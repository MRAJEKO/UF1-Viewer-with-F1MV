const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let lapCount;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current
        .improvements;
    lapCount = config.lap_amount;
}

function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

function getElement(path) {
    return document.querySelector(path);
}

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

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

let driverList;
let tireData;
let timingData;
let bestTimes;
let sessionInfo;
let topThree;

function apiRequests() {
    let endpoints =
        "DriverList,TimingAppData,TimingData,TimingStats,SessionInfo,TopThree,SessionStatus";
    let api = JSON.parse(
        httpGet("http://localhost:10101/api/v2/live-timing/state/" + endpoints)
    );
    driverList = api.DriverList;
    tireData = api.TimingAppData.Lines;
    timingData = api.TimingData.Lines;
    bestTimes = api.TimingStats.Lines;
    sessionInfo = api.SessionInfo;
    topThree = api.TopThree.Lines;
    sessionStatus = api.SessionStatus.Status;
}

function inPit(driver) {
    if (
        timingData[driver].Stopped ||
        timingData[driver].InPit ||
        timingData[driver].Retired
    ) {
        return true;
    }
    return false;
}

function slowLap(driver) {
    if (
        timingData[driver].PitOut ||
        timingData[driver].Sectors[0].Segments[0].Status == 2064 ||
        sessionStatus == "Aborted"
    ) {
        return true;
    }
    return false;
}

function difference(time) {
    if (sessionInfo.Type == "Race") {
        return time;
    } else if (sessionInfo.Type == "Qualifying") {
        return time + 1;
    }
    return time + 3;
}

function pushLap(driver) {
    for (sector in timingData[driver].Sectors) {
        let bestSector = +bestTimes[driver].BestSectors[sector].Value;
        let currentSector = +timingData[driver].Sectors[sector].Value;
        if (difference(bestSector) > currentSector && currentSector != 0) {
            return true;
        }
        for (segment in timingData[driver].Sectors[sector].Segments) {
            let segmentStatus =
                timingData[driver].Sectors[sector].Segments[segment].Status;
            if (
                segmentStatus == 2051 ||
                segmentStatus == 2049 ||
                bestSector == currentSector
            ) {
                return true;
            }
        }
    }
    return false;
}

function checkStatus() {
    for (i in timingData) {
        if (inPit(i)) {
            console.log(i + " is in pit");
            continue;
        }
        if (slowLap(i)) {
            console.log(i + " is on a slow lap");
            continue;
        }
        if (pushLap(i)) {
            console.log(i + " is on a push lap");
            continue;
        }
        console.log(i + " is on a slow lap");
    }
}

async function run() {
    await getConfigurations();
    apiRequests();
    checkStatus();
}

console.log("Run");
run();
