const debug = true;

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
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

function apiRequests() {
    let endpoints =
        "DriverList,TimingAppData,TimingData,TimingStats,SessionInfo";
    let api = JSON.parse(
        httpGet("http://localhost:10101/api/v2/live-timing/state/" + endpoints)
    );
    driverList = api.DriverList;
    tireData = api.TimingAppData.Lines;
    timingData = api.TimingData.Lines;
    bestTimes = api.TimingStats.Lines;
    sessionInfo = api.SessionInfo;
}

let bestLapTimes = [];

function getImprovedDriver() {
    for (i in timingData) {
        if (
            timingData[i].LastLapTime.PersonalFastest &&
            timingData[i].BestLapTime.Value != bestLapTimes[i]
        ) {
            bestLapTimes[i] = timingData[i].BestLapTime.Value;
            console.log(i);
        }
    }
    console.log(bestLapTimes);
}

async function run() {
    apiRequests();
    getImprovedDriver();
    if (debug) {
        console.log(driverList);
        console.log(tireData);
        console.log(timingData);
        console.log(bestTimes);
        console.log(sessionInfo);
    }
    await sleep(10000);
    apiRequests();
    getImprovedDriver();
}

run();
