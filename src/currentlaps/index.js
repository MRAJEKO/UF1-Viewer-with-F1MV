const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let host;
let port;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = config.port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
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

async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query LiveTimingState {
      liveTimingState {
        DriverList
        TimingAppData
        TimingData
        TimingStats
        SessionInfo
        TopThree
        SessionStatus
      }
    }`,
                    operationName: "LiveTimingState",
                }),
                method: "POST",
            })
        ).json()
    ).data.liveTimingState;
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
        if (
            difference(bestSector) > currentSector &&
            currentSector != 0 &&
            !timingData[driver].LastLapTime.PersonalFastest &&
            timingData[driver].Sectors[0].Segments[
                +timingData[driver].Sectors[0].Segments.length - 1
            ].Status != 0
        ) {
            return true;
        }
        for (segment in timingData[driver].Sectors[sector].Segments) {
            let segmentStatus =
                timingData[driver].Sectors[sector].Segments[segment].Status;
            if (
                segmentStatus == 2051 ||
                (bestSector == currentSector &&
                    timingData[driver].Sectors[0].Segments[
                        +timingData[driver].Sectors[0].Segments.length - 1
                    ].Status != 0)
            ) {
                return true;
            }
        }
    }
    return false;
}

function getPosition() {
    loop1: for (timing in timingData) {
        let segment = 0;
        loop2: for (sector in timingData[timing].Sectors) {
            let sectorLength =
                timingData[timing].Sectors[sector].Segments.length;
            loop3: for (currentSegment in timingData[timing].Sectors[sector]
                .Segments) {
                if (
                    timingData[timing].Sectors[sector].Segments[currentSegment]
                        .Status == 0
                ) {
                    segment += +currentSegment;

                    driverStatusses[timing]["segment"] = segment + 1;
                    break loop2;
                } else {
                    driverStatusses[timing]["segment"] = 1;
                }
            }
            segment += +sectorLength;
        }
    }
}

function sortDriversOnPosition(statuses) {
    let counter = trackSegmentCount;
    let pushDriverOrder = [];
    let slowDriverOrder = [];
    while (counter != 0) {
        for (i in statuses) {
            if (statuses[i].segment == counter) {
                if (statuses[i].status == 0) {
                    console.log(i);
                    pushDriverOrder.push(i);
                }
                if (statuses[i].status == 1) {
                    slowDriverOrder.push(i);
                }
            }
        }
        counter--;
    }
    console.log(pushDriverOrder);
    console.log(slowDriverOrder);
}

function getStatus() {
    for (i in timingData) {
        driverStatusses[i] = {};
        if (inPit(i)) {
            driverStatusses[i]["status"] = 2;
            console.log(i + " is in pit");
            continue;
        }
        if (slowLap(i)) {
            driverStatusses[i]["status"] = 1;
            console.log(i + " is on a slow lap");
            continue;
        }
        if (pushLap(i)) {
            driverStatusses[i]["status"] = 0;
            console.log(i + " is on a push lap");
            continue;
        }
        driverStatusses[i]["status"] = 1;
        console.log(i + " is on a slow lap");
    }
    return driverStatusses;
}

let trackSegmentCount = 0;
function getTrackSegmentCount() {
    let firstTimingData = timingData[Object.keys(timingData)[0]];
    for (i in firstTimingData.Sectors) {
        trackSegmentCount += +firstTimingData.Sectors[i].Segments.length;
    }
    console.log(trackSegmentCount);
}

let driverStatusses = {};
async function run() {
    await getConfigurations();
    await apiRequests();
    getTrackSegmentCount();
    // while (true)
    getStatus();
    getPosition();
    sortDriversOnPosition(driverStatusses);
    console.log(driverStatusses);
}

console.log("Run");
run();
