const debug = false;

const { ipcRenderer } = require("electron");

const npm_f1mv_api = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await npm_f1mv_api.discoverF1MVInstances(host)).port;
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
    const config = {
        host: host,
        port: port,
    };

    const liveTimingClock = await npm_f1mv_api.LiveTimingClockAPIGraphQL(config, ["trackTime", "systemTime", "paused"]);

    const liveTimingState = await npm_f1mv_api.LiveTimingAPIGraphQL(config, [
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
        await apiRequests();
        const pushDrivers = getAllPushDriverPositions();
        for (let driver of pushDrivers) {
            await initiateTemplate(driver);
        }
        const container = document.getElementById("container").children;

        for (let child of container) {
            const driverNumber = child.id.substring(1);

            updateTemplate(driverNumber, pushDrivers);
        }

        for (let driver in timingData) {
            saveTimeOfNewLap(driver);
        }

        if (debug) {
            console.log(driverLaps);

            console.log(pushDrivers);
        }
    }
}

function getAllPushDriverPositions() {
    let pushDriversPositions = [];

    for (const driverNumber in timingData) {
        const isDriverPushing = isDriverOnPushLap(driverNumber);

        if (!isDriverPushing) continue;

        let driverPosition = getDriverPosition(driverNumber);

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

    let isPushing = false;
    for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
        const sector = driverTimingData.Sectors[sectorIndex];
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        const completedFirstSector = !driverTimingData.Sectors[0].Segments.some((segment) => segment.Status === 0);

        if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
            isPushing = false;
            break;
        }

        if (sectorTime - bestSectorTime < pushDeltaThreshold && completedFirstSector) {
            isPushing = true;
            continue;
        }

        if (sector.Segments.some((segment) => segment.Status === 2051)) {
            isPushing = true;
            continue;
        }
    }

    return isPushing;
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
            return "#9c27b0";
        case 2052:
            return "#f44336";
        case 2064:
            return "#2196f3";
        case 2068:
            return "#f44336";

        case "red":
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

        case "ob":
            return "#9c27b0";
        case "pb":
            return "#4caf50";
        case "ni":
            return "#fdd835";

        default:
            return "#5b5b5d";
    }
}

function rgbToHex(rgb) {
    // Extract the red, green, and blue components from the RGB value
    const [r, g, b] = rgb.match(/\d+/g).map((x) => parseInt(x, 10));

    // Convert the red, green, and blue values to hexadecimal
    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");

    // Return the hexadecimal color code
    return `#${hexR}${hexG}${hexB}`;
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

    const currentLap = driverTimingData.NumberOfLaps;

    listItem.innerHTML = HTMLPushLap;

    listItem.classList.add("pushlap");
    listItem.id = "n" + driverNumber;
    listItem.lapNumber = currentLap;

    container.prepend(listItem);

    await sleep(10);

    listItem.classList.add("show");
}

driverLaps = {};
function saveTimeOfNewLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const lastStatus = driverTimingData.Sectors.slice(-1)[0].Segments.slice(-1)[0].Status;

    const currentDriverLap = driverTimingData.NumberOfLaps;

    let newLap;
    if (driverLaps[driverNumber]) {
        newLap = lastStatus !== 2064 && lastStatus !== 0 && driverLaps[driverNumber].lap !== currentDriverLap;
    } else {
        newLap = lastStatus !== 2064 && lastStatus !== 0;
    }

    if (newLap) {
        const trackTime = clockData.trackTime;
        const systemTime = clockData.systemTime;
        const now = Date.now();
        const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));
        driverLaps[driverNumber] = { time: localTime, lap: currentDriverLap };
    }
}

function formatMsToF1(ms, fixedAmount) {
    const minutes = Math.floor(ms / 60000);

    let milliseconds = ms % 60000;

    const seconds =
        milliseconds / 1000 < 10 && minutes > 0
            ? "0" + (milliseconds / 1000).toFixed(fixedAmount)
            : (milliseconds / 1000).toFixed(fixedAmount);

    return minutes > 0 ? minutes + ":" + seconds : seconds;
}

function updateTemplate(driverNumber, pushDrivers) {
    const driverTimingData = timingData[driverNumber];

    const driverElement = document.getElementById(`n${driverNumber}`);

    const elementLapTime = driverElement.lapNumber;

    const currentDriverLap = driverTimingData.NumberOfLaps;

    const lapTimeElement = document.querySelector(`#n${driverNumber} .times .personal p`);

    if (!pushDrivers.includes(driverNumber)) {
        console.log(`Remove ${driverNumber} from list`);

        if (driverTimingData.InPit && elementLapTime === currentDriverLap) {
            lapTimeElement.textContent = "IN PIT";
            lapTimeElement.style.color = getColorFromStatusCodeOrName("red");
        } else if (driverTimingData.Sectors.slice(-1)[0].Segments.slice(-1)[0].Status !== 0) {
            const color = getColorFromStatusCodeOrName(
                driverTimingData.LastLapTime.OverallFastest
                    ? "ob"
                    : driverTimingData.LastLapTime.PersonalFastest
                    ? "pb"
                    : "ni"
            );

            lapTimeElement.textContent = driverTimingData.LastLapTime.Value;
            lapTimeElement.style.color = color;
        } else if (elementLapTime === currentDriverLap) {
            lapTimeElement.textContent = "ABORTED";
            lapTimeElement.style.color = getColorFromStatusCodeOrName("red");
        }

        // Set last segment color

        const sectors = driverTimingData.Sectors;

        const lastSectorIndex = sectors.length - 1;

        const lastSegmentIndex = sectors[lastSectorIndex].Segments.length - 1;

        const lastSegmentColor = getColorFromStatusCodeOrName(
            sectors[lastSectorIndex].Segments[lastSegmentIndex].Status
        );

        const lastSegmentElement = document.querySelector(
            `#n${driverNumber} .sectors #sector${lastSectorIndex} .segments #segment${lastSegmentIndex}`
        );

        console.log(lastSegmentElement.style.backgroundColor);

        const elementBackgroundColor = rgbToHex(lastSegmentElement.style.backgroundColor);

        if (elementBackgroundColor == getColorFromStatusCodeOrName("gray")) {
            lastSegmentElement.style.backgroundColor = lastSegmentColor;
        }

        return;
    }

    // Position
    const position = driverTimingData.Position;

    let displayedPosition = document.querySelector(`#n${driverNumber} .position p`).innerHTML;

    if (displayedPosition != position) document.querySelector(`#n${driverNumber} .position p`).innerHTML = position;

    // Current lap time
    const trackTime = clockData.trackTime;
    const systemTime = clockData.systemTime;
    const now = Date.now();
    const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

    if (driverLaps[driverNumber]) {
        if (driverNumber == 1) {
            console.log(driverLaps[driverNumber].lap);
            console.log(currentDriverLap);
        }

        if (driverLaps[driverNumber].lap !== currentDriverLap) {
            lapTimeElement.textContent = driverTimingData.LastLapTime.Value;
        } else {
            const timeDiff = localTime - driverLaps[driverNumber].time;

            const displayTime = formatMsToF1(timeDiff, 1);

            lapTimeElement.textContent = displayTime;
            lapTimeElement.style.color = "white";
        }
    } else {
        lapTimeElement.textContent = "NO TIME";
        lapTimeElement.style.color = getColorFromStatusCodeOrName("gray");
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

    const targetPositionElement = document.querySelector(`#n${driverNumber} .times .target .bottom .target-position p`);

    targetPositionElement.textContent = "P" + targetPosition;

    const targetDriverNumber = topThree[targetPosition - 1].RacingNumber;

    if (targetPosition <= 3) {
        const targetName = driverList[targetDriverNumber].LastName.toUpperCase();

        document.querySelector(`#n${driverNumber} .times .target .bottom .target-name p`).textContent = targetName;
    }

    const sectors = driverTimingData.Sectors;

    const bestTargetTimes = bestTimes[targetDriverNumber];

    const completedFirstSector = driverTimingData.Sectors[0].Segments.slice(-1)[0].Status !== 0;

    let currentSectorIndex = 0;
    for (let sectorIndex in sectors) {
        if (sectors[sectorIndex].Segments.slice(-1)[0].Status === 0) break;
        currentSectorIndex++;
    }

    let targetTime = "NO TIME";
    let targetDelta = "NO DELTA";
    if (bestTargetTimes.PersonalBestLapTime.Value !== "") {
        for (let targetBestSectorIndex in bestTargetTimes.BestSectors) {
            const targetBestSectorTime = bestTargetTimes.BestSectors[targetBestSectorIndex].Value;

            if (targetBestSectorIndex > currentSectorIndex) break;

            targetTime =
                targetTime === "NO TIME"
                    ? (targetTime = parseLapOrSectorTime(targetBestSectorTime))
                    : (targetTime += parseLapOrSectorTime(targetBestSectorTime));
        }

        console.log(targetTime);
        targetTime = formatMsToF1(targetTime * 1000, 3);
    }

    const targetTimeElement = document.querySelector(`#n${driverNumber} .times .target .top .target-time p`);

    if (!targetTimeElement.textContent !== targetTime) {
        targetTimeElement.textContent = targetTime;
        targetTimeElement.style.color = "white";
    }

    if (targetTime !== "NO TIME" && completedFirstSector) {
        let totalSectorTimes = 0;
        let totalTargetBestSectorTimes = 0;
        for (let sectorCounter = currentSectorIndex - 1; sectorCounter >= 0; sectorCounter--) {
            totalSectorTimes += parseLapOrSectorTime(sectors[sectorCounter].Value);
            totalTargetBestSectorTimes += parseLapOrSectorTime(bestTargetTimes.BestSectors[sectorCounter].Value);
        }

        const targetDeltaElement = document.querySelector(`#n${driverNumber} .times .target .top .delta p`);

        const deltaToTargetTime = totalSectorTimes - totalTargetBestSectorTimes;

        targetDelta = deltaToTargetTime >= 0 ? "+" + deltaToTargetTime.toFixed(3) : deltaToTargetTime.toFixed(3);

        if (targetDeltaElement.textContent != targetDelta) targetDeltaElement.textContent = targetDelta;
    }

    console.log(driverNumber);
    console.log(targetTime);

    // Sectors

    // console.log(bestTargetTimes);

    // console.log(driverNumber);

    console.log(sectors);

    for (let sectorIndex in sectors) {
        const sectorTimeElement = document.querySelector(
            `#n${driverNumber} .sectors #sector${sectorIndex} .sector-times .sector-time p`
        );

        if (completedFirstSector && sectors[sectorIndex].Value != "") {
            if (sectorTimeElement.textContent !== sectors[sectorIndex].Value) {
                sectorTimeElement.textContent = sectors[sectorIndex].Value;
                sectorTimeElement.style.color = "white";
            }
        } else {
            if (sectorTimeElement.textContent !== "NO TIME") {
                sectorTimeElement.textContent = "NO TIME";
                sectorTimeElement.style.color = getColorFromStatusCodeOrName("gray");
            }
        }

        const segments = sectors[sectorIndex].Segments;

        for (let segmentIndex in segments) {
            const segmentColor = getColorFromStatusCodeOrName(segments[segmentIndex].Status);

            const segmentElement = document.querySelector(
                `#n${driverNumber} .sectors #sector${sectorIndex} .segments #segment${segmentIndex}`
            );

            segmentElement.style.backgroundColor = segmentColor;
        }
    }

    if (debug) console.log(targetPosition);
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
