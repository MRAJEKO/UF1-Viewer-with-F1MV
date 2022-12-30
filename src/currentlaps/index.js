const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Define colors
const purple = "#9c27b0";
const green = "#4caf50";
const yellow = "#fdd835";
const blue = "#2196f3";
const red = "#f44336";

async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = config.port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
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

async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query clockAndTimings {
                        liveTimingClock {
                            trackTime
                            systemTime
                            paused
                        }
                        liveTimingState {
                            DriverList
                            TimingAppData
                            TimingData
                            TimingStats
                            SessionInfo
                            TopThree
                            SessionStatus
                        }
                        }
                        `,
                    operationName: "clockAndTimings",
                }),
                method: "POST",
            })
        ).json()
    ).data;

    const liveTimingState = api.liveTimingState;
    driverList = liveTimingState.DriverList;
    tireData = liveTimingState.TimingAppData.Lines;
    timingData = liveTimingState.TimingData.Lines;
    bestTimes = liveTimingState.TimingStats.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    topThree = liveTimingState.TopThree.Lines;
    sessionStatus = liveTimingState.SessionStatus.Status;

    clockData = api.liveTimingClock;
}

getConfigurations();
async function run() {
    while (true) {
        await sleep(250);
        await apiRequests();
        const pushDrivers = getAllPushDriverPositions();
        for (let driver of pushDrivers) {
            await initiateTemplate(driver);
            updateTemplate(driver);
        }
        for (let driver in timingData) {
            saveTimeOfNewLap(driver);
        }

        console.log(driverLaps);

        console.log(pushDrivers);
    }
}

function getAllPushDriverPositions() {
    let pushDriversPositions = [];

    for (const driverNumber in timingData) {
        const isDriverPushing = isDriverOnPushLap(driverNumber);

        if (!isDriverPushing) continue;

        const driverPosition = getDriverPosition(driverNumber);
        if (driverPosition === 0) continue;

        pushDriversPositions.push({ driver: driverNumber, position: driverPosition });
    }

    pushDriversPositions.sort((a, b) => b.position - a.position);

    const sortedDrivers = pushDriversPositions.map((driverNumber) => driverNumber.driver);

    return sortedDrivers;
}

function parseLapOrSectorTime(time) {
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

function isDriverOnPushLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    const driverBestTimes = bestTimes[driverNumber];

    if (driverTimingData.InPit) return false;

    if (driverTimingData.Sectors[0].Segments[0].Status === 2064) return false;

    const pushDeltaThreshold = sessionType === "Race" ? 0 : sessionType === "Qualifying" ? 1 : 3;

    return Object.keys(driverTimingData.Sectors).some((sectorIndex) => {
        const sector = driverTimingData.Sectors[sectorIndex];
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        if (sector.Segments.some((segment) => segment.Status === 2051)) return true;

        const completedFirstSector = !driverTimingData.Sectors[0].Segments.some((segment) => segment.Status === 0);

        if (sectorTime - bestSectorTime < pushDeltaThreshold && completedFirstSector) return true;

        return false;
    });
}

function getDriverPosition(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    const sectors = driverTimingData.Sectors;

    let currentSegment = 0;

    for (let sectorIndex = 0; sectorIndex < sectors.length; sectorIndex++) {
        for (let segmentIndex = 0; segmentIndex < sectors[sectorIndex].Segments.length; segmentIndex++) {
            if (sectors[sectorIndex].Segments[segmentIndex].Status === 0) return currentSegment + segmentIndex;
        }
        currentSegment += sectors[sectorIndex].Segments.length;
    }
    return 0;
}

function getColorFromStatusCodeOrName(codeOrName) {
    switch (codeOrName) {
        case 2048:
            return "#fdd835";
        case 2049:
            return "#4caf50";
        case 2051:
            return "#fdd835";
        case 2052:
            return "#f44336";
        case 2064:
            return "#2196f3";
        case 2068:
            return "#f44336";
        case "S":
            return "#ff0000";
        case "M":
            return "#ffde00";
        case "H":
            return "#dbdada";
        case "I":
            return "#2c7515";
        case "W":
            return "#3d7ba3";
        default:
            return "#5b5b5d";
    }
}

async function initiateTemplate(driverNumber) {
    const container = document.getElementById("container");

    if (container.querySelector(`#n${driverNumber}`) !== null) return;

    const driverTimingData = timingData[driverNumber];

    const noTimeColor = getColorFromStatusCodeOrName("gray");

    // Header
    const teamColor = "#" + driverList[driverNumber].TeamColour;

    const teamIcon = await ipcRenderer.invoke("get_icon", driverList[driverNumber].TeamName);

    const driverName = driverList[driverNumber].LastName.toUpperCase();

    const currentTire = tireData[driverNumber].Stints.pop().Compound.charAt(0);

    const tireColor = getColorFromStatusCodeOrName(currentTire);

    const HTMLHeaderElement = `<div class="position"><p>0</p></div><div class="icon" style="background-color: ${teamColor}"><img src="${teamIcon}" alt="" /></div><div class="name"><p>${driverName}</p></div><div class="tire"><p style="color: ${tireColor}">${currentTire}</p></div>`;

    // Times
    const HTMLTimesElement = `<div class="personal"><p style="color: ${noTimeColor}">NO TIME</p></div><div class="target"><div class="top"><div class="delta"><p style="color: ${noTimeColor}">NO DELTA</p></div><div class="target-time"><p style="color: ${noTimeColor}">NO TIME</p></div></div><div class="bottom">
    <div class="target-position"><p>0</p></div><div class="target-name"><p>NO DRIVER</p></div></div></div>`;

    // Sectors
    const sectors = driverTimingData.Sectors;

    let HTMLAllSectors = "";
    for (let sectorIndex = 0; sectorIndex < sectors.length; sectorIndex++) {
        const driverSegmentData = sectors[sectorIndex].Segments;

        let segments = "";
        for (let count = 0; count < driverSegmentData.length; count++) {
            const HTMLSegment = `<div class="segment" id="segment${count}" style="background-color: ${noTimeColor}"></div>`;
            segments += HTMLSegment;
        }

        const HTMLSectorElement = `<div id="sector${sectorIndex}" class="sector"><div class="sector-times"><div class="sector-time"><p style="color: ${noTimeColor}">NO TIME</p></div><div class="sector-delta" style="display: none"><p>NO DELTA</p></div></div><div class="segments">${segments}</div></div>`;

        HTMLAllSectors += HTMLSectorElement;
    }
    let listItem = document.createElement("li");
    const HTMLPushLap = `
    <div class="header">${HTMLHeaderElement}</div>
    <div class="times">${HTMLTimesElement}</div>
    <div class="sectors">${HTMLAllSectors}</div>
    `;

    listItem.innerHTML = HTMLPushLap;

    listItem.classList.add("pushlap", "show");
    listItem.id = "n" + driverNumber;

    container.prepend(listItem);
}

driverLaps = {};
function saveTimeOfNewLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const lastStatus = driverTimingData.Sectors.slice(-1)[0].Segments.slice(-1)[0].Status;

    const newLap = lastStatus !== 2064 && lastStatus !== 0;

    if (newLap) {
        const trackTime = clockData.trackTime;
        const systemTime = clockData.systemTime;
        const now = Date.now();
        const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

        driverLaps[driverNumber] = localTime;
    }
}

function formatMsToF1(ms, fixedAmount) {
    const minutes = Math.floor(ms / 60000);

    let milliseconds = ms % 60000;

    const seconds =
        Math.floor(milliseconds / 1000) < 10 && minutes > 0
            ? "0" + Math.floor(milliseconds / 1000)
            : Math.floor(milliseconds / 1000);

    milliseconds = (milliseconds % 1000).toString().slice(0, fixedAmount);

    if (milliseconds == "") milliseconds = 0;

    return minutes > 0 ? minutes + ":" + seconds + "." + milliseconds : seconds + "." + milliseconds;
}

function updateTemplate(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    // Position
    const position = driverTimingData.Position;

    let displayedPosition = document.querySelector(`#n${driverNumber} .position p`).innerHTML;

    if (displayedPosition != position) document.querySelector(`#n${driverNumber} .position p`).innerHTML = position;

    // Current lap time
    const trackTime = clockData.trackTime;
    const systemTime = clockData.systemTime;
    const now = Date.now();
    const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

    const timeDiff = localTime - driverLaps[driverNumber];

    if (isNaN(timeDiff)) {
        document.querySelector(`#n${driverNumber} .times .personal p`).textContent = "NO TIME";
    } else {
        const displayTime = formatMsToF1(timeDiff, 0);

        document.querySelector(`#n${driverNumber} .times .personal p`).textContent = displayTime;
    }

    // Target
    let targetPosition = 1;
    if (sessionType === "Practice") {
        targetPosition = position == 1 ? 2 : 1;
    } else if (sessionType === "Qualifying") {
        console.log("Qualifying");
    } else {
        console.log("Race");
    }

    document.querySelector(`#n${driverNumber} .times .target .bottom .target-position p`).textContent =
        "P" + targetPosition;

    if (targetPosition <= 3) {
        const targetName = driverList[topThree[targetPosition - 1].RacingNumber].LastName.toUpperCase();

        document.querySelector(`#n${driverNumber} .times .target .bottom .target-name p`).textContent = targetName;
    }

    console.log(targetPosition);
}

// function initiateTemplate(driverNumber) {
//     const driverTimingData = timingData[driverNumber];
//     const driverBestTimingData = bestTimes[driverNumber];
//     console.log(driverTimingData);

//     // Sectors
//     for (let sectorIndex in driverTimingData.Sectors) {
//         driverSectorData = driverTimingData.Sectors[sectorIndex];
//         driverSegmentData = driverSectorData.Segments;

//         // Segments
//         let segments = "";
//         for (let count = 0; count < driverSegmentData.length; count++) {
//             const segmentColor = getColorFromStatusCodeOrName(driverSegmentData[count].Status);
//             const HTMLSegment = `<div class="segment" id="segment${count}" style="background-color: ${segmentColor}"></div>`;
//             segments += HTMLSegment;
//         }

//         // Sector time
//         const currentSectorTime = parseLapOrSectorTime(driverSectorData.Value);

//         const completedSector = driverSegmentData.pop().Status === 0 ? false : true;
//         const HTMLSegmentTime = completedSector
//             ? `<p>${currentSectorTime.toFixed(3)}</p>`
//             : `<p style="color: ${getColorFromStatusCodeOrName("gray")}">NO TIME</p>`;

//         // Sector Delta
//         const bestSectorTime = parseLapOrSectorTime(driverBestTimingData.BestSectors[sectorIndex].Value);

//         const sectorTimeDelta = currentSectorTime - bestSectorTime;
//         console.log(sectorTimeDelta);
//         console.log(bestSectorTime);

//         console.log(HTMLSegmentTime);
//         console.log(driverSegmentData);
//         console.log(segments);
//         sectorTime = driverSectorData.Value;
//     }
// }

run();
