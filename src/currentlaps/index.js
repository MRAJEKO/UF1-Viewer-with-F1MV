const debug = false;

// The duration of the sector times being show when completing a sector
// (All times are in MS)
const holdSectorTimeDuration = 4000;
const holdEndOfLapDuration = 7000;
const loopspeed = 80;

const { ipcRenderer } = require("electron");

const npm_f1mv_api = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Apply any configuration from the config.json file
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await npm_f1mv_api.discoverF1MVInstances(host)).port;
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

// Run all function and create a loop to refresh
async function run() {
    await getConfigurations();
    while (true) {
        await sleep(loopspeed);
        await apiRequests();
        const pushDrivers = getAllPushDriverPositions();
        // Check for every driver if he is pushing and then initiate a template
        for (let driver of pushDrivers) {
            await initiateTemplate(driver);
        }
        const container = document.getElementById("container").children;

        // Update the template for every item inside of the container
        for (let child of container) {
            const driverNumber = child.id.substring(1);

            updateTemplate(driverNumber, pushDrivers);
        }

        // Save the current time when a lap get started by a driver
        for (let driver in timingData) {
            saveTimeOfNewLap(driver);
        }

        if (debug) {
            console.log(driverLaps);

            console.log(pushDrivers);
        }
    }
}

// Get the position of all the drivers and sort them accordingly
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

    // Return a array with all the driver numbers that are on a push lap in the order of position on track
    return sortedDrivers;
}

// A lap or sector time can be send through and will return as a number in seconds
function parseLapOrSectorTime(time) {
    // Split the input into 3 variables by checking if there is a : or a . in the time. Then replace any starting 0's by nothing and convert them to numbers using parseInt.
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

// Check if the driver is on a push lap or not
function isDriverOnPushLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    const driverBestTimes = bestTimes[driverNumber];

    if (driverTimingData.InPit) return false;

    // If the first mini sector time is status 2064, meaning he is on a out lap, return false
    if (driverTimingData.Sectors[0].Segments[0].Status === 2064) return false;

    // Get the threshold to which the sector time should be compared to the best personal sector time.
    const pushDeltaThreshold = sessionType === "Race" ? 0 : sessionType === "Qualifying" ? 1 : 3;

    let isPushing = false;
    for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
        const sectors = driverTimingData.Sectors;
        const sector = sectors[sectorIndex];
        const lastSectorIndex = sectors.length - 1;
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        // Check if the first sector is completed by checking if the last segment of the first sector has a value meaning he has crossed the last point of that sector and the final sector time does not have a value. The last check is done because sometimes the segment already has a status but the times are not updated yet.
        const completedFirstSector =
            driverTimingData.Sectors[0].Segments.slice(-1)[0].Status !== 0 && sectors[lastSectorIndex].Value === "";

        // If the first sector time is above the threshold it should imidiately break because it will not be a push lap
        if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
            isPushing = false;
            break;
        }

        // If the first sector time is lower then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sectorTime - bestSectorTime < pushDeltaThreshold && completedFirstSector) {
            isPushing = true;
            continue;
        }

        // If the driver has a fastest segment overall it would temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sector.Segments.some((segment) => segment.Status === 2051)) {
            isPushing = true;
            continue;
        }
    }

    // Return the final pushing state
    return isPushing;
}

// Get the position of the driver based on their segments
function getDriverPosition(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    const sectors = driverTimingData.Sectors;

    // The starting segment will always be 0 because if there is no 0 state anywhere all segments will be completed and the current segment will be the first one.
    let currentSegment = 0;

    for (let sectorIndex = 0; sectorIndex < sectors.length; sectorIndex++) {
        for (let segmentIndex = 0; segmentIndex < sectors[sectorIndex].Segments.length; segmentIndex++) {
            if (sectors[sectorIndex].Segments[segmentIndex].Status === 0) return currentSegment + segmentIndex;
        }
        currentSegment += sectors[sectorIndex].Segments.length;
    }
    return 0;
}

// Set all statusses or names to the corect hex code
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
        case "yellow":
            return "#fdd835";
        case "green":
            return "#4caf50";
        case "purple":
            return "#9c27b0";

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

// Convert the RBG values to hex
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

// Initiate HTML element for a driver's pushlap
async function initiateTemplate(driverNumber) {
    const container = document.getElementById("container");

    if (container.querySelector(`#n${driverNumber}`) !== null) return;

    const driverTimingData = timingData[driverNumber];

    const noTimeColor = getColorFromStatusCodeOrName("gray");

    // Defining all header information
    const teamColor = "#" + driverList[driverNumber].TeamColour;

    const teamIcon = await ipcRenderer.invoke("get_icon", driverList[driverNumber].TeamName);

    const driverName = driverList[driverNumber].LastName.toUpperCase();

    const currentTire = tireData[driverNumber].Stints.pop().Compound.charAt(0);

    const tireColor = getColorFromStatusCodeOrName(currentTire);

    // Creating the header element including all tags
    const HTMLHeaderElement = `<div class="position"><p>0</p></div><div class="icon" style="background-color: ${teamColor}"><img src="${teamIcon}" alt="" /></div><div class="name"><p>${driverName}</p></div><div class="tire"><p style="color: ${tireColor}">${currentTire}</p></div>`;

    // Creating the times element including all tags
    const HTMLTimesElement = `<div class="personal"><p style="color: ${noTimeColor}">NO TIME</p></div><div class="target"><div class="top"><div class="delta"><p style="color: ${noTimeColor}">NO DELTA</p></div><div class="target-time"><p style="color: ${noTimeColor}">NO TIME</p></div></div><div class="bottom">
    <div class="target-position"><p>0</p></div><div class="target-name"><p>NO DRIVER</p></div></div></div>`;

    // Define all sector information
    const sectors = driverTimingData.Sectors;

    let HTMLAllSectors = "";
    for (let sectorIndex = 0; sectorIndex < sectors.length; sectorIndex++) {
        const driverSegmentData = sectors[sectorIndex].Segments;

        let segments = "";
        for (let count = 0; count < driverSegmentData.length; count++) {
            const HTMLSegment = `<div class="segment" id="segment${count}" style="background-color: ${noTimeColor}"></div>`;
            segments += HTMLSegment;
        }

        // Creating the sector element
        const HTMLSectorElement = `<div id="sector${sectorIndex}" class="sector"><div class="sector-times"><div class="sector-time"><p style="color: ${noTimeColor}">NO TIME</p></div><div class="sector-delta" style="display: none"><p>NO DELTA</p></div></div><div class="segments">${segments}</div></div>`;

        HTMLAllSectors += HTMLSectorElement;
    }

    // Create a new list item and add all the previous elements into that
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

let removingDrivers = [];
function removeDriver(driverNumber) {
    const driverElement = document.getElementById(`n${driverNumber}`);
    driverElement.classList.remove("show");

    setTimeout(() => {
        driverElement.remove();
        const driverNumberIndex = removingDrivers.indexOf(driverNumber);
        removingDrivers.splice(driverNumberIndex, 1);
    }, 400);
}

function setPosition(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const position = driverTimingData.Position;

    let displayedPosition = document.querySelector(`#n${driverNumber} .position p`).innerHTML;

    if (displayedPosition != position) document.querySelector(`#n${driverNumber} .position p`).innerHTML = position;
}

function setCurrentLapTime(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const sectors = driverTimingData.Sectors;

    const lastSectorIndex = sectors.length - 1;

    const completedFirstSector =
        (sectors[0].Segments.slice(-1)[0].Status !== 0 && sectors[lastSectorIndex].Value === "") ||
        sectors[lastSectorIndex].Segments.slice(-1)[0].Status !== 0;

    let totalSectorTimes = 0;
    let previousSectorIndex = 0;
    if (completedFirstSector) {
        for (const sectorIndex in sectors) {
            if (sectors[sectorIndex].Value === "") break;

            const sectorTime = parseLapOrSectorTime(sectors[sectorIndex].Value);

            totalSectorTimes =
                totalSectorTimes === 0 ? (totalSectorTimes = sectorTime) : (totalSectorTimes += sectorTime);

            previousSectorIndex = sectorIndex;
        }
    }

    const lapTimeElement = document.querySelector(`#n${driverNumber} .times .personal p`);
    const trackTime = clockData.trackTime;
    const systemTime = clockData.systemTime;
    const now = Date.now();
    const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

    const currentDriverLap = driverTimingData.NumberOfLaps;

    if (driverLaps[driverNumber]) {
        if (driverLaps[driverNumber].lap !== currentDriverLap) {
            lapTimeElement.textContent = driverTimingData.LastLapTime.Value;
        } else {
            const timeDiff = localTime - driverLaps[driverNumber].time;

            const numberDisplayTime = timeDiff / 1000;

            const msPastSector = (numberDisplayTime - totalSectorTimes) * 1000;

            let displayTime = formatMsToF1(timeDiff, 1);

            let color = "white";

            if (totalSectorTimes !== 0 && msPastSector <= holdSectorTimeDuration) {
                displayTime = formatMsToF1(totalSectorTimes * 1000, 3);
                color = getColorFromStatusCodeOrName(
                    driverTimingData.Sectors[previousSectorIndex].OverallFastest
                        ? "purple"
                        : driverTimingData.Sectors[previousSectorIndex].PersonalFastest
                        ? "green"
                        : "yellow"
                );
            }

            lapTimeElement.textContent = displayTime;
            lapTimeElement.style.color = color;
        }
    } else {
        lapTimeElement.textContent = "NO TIME";
        lapTimeElement.style.color = getColorFromStatusCodeOrName("gray");
    }
}

function setTargetInfo(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const position = driverTimingData.Position;

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

    const lastSectorIndex = sectors.length - 1;

    const bestTargetTimes = bestTimes[targetDriverNumber];

    const completedFirstSector =
        (driverTimingData.Sectors[0].Segments.slice(-1)[0].Status !== 0 && sectors[lastSectorIndex].Value === "") ||
        sectors[lastSectorIndex].Segments.slice(-1)[0].Status !== 0;

    let currentSectorIndex = 0;
    for (let sectorIndex in sectors) {
        const lastSectorIndex = sectors.length - 1;
        if (sectors[lastSectorIndex].Segments.slice(-1)[0].Status !== 0) {
            currentSectorIndex = lastSectorIndex;
            break;
        }
        if (sectors[0].Segments.slice(-1)[0].Status === 0) break;
        if (sectors[sectorIndex].Value === "" || sectors[lastSectorIndex].Value !== "") break;
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

        targetTime = formatMsToF1(targetTime * 1000, 3);
    }

    const targetTimeElement = document.querySelector(`#n${driverNumber} .times .target .top .target-time p`);

    if (!targetTimeElement.textContent !== targetTime) {
        setTimeout(() => {
            targetTimeElement.textContent = targetTime;
            targetTimeElement.style.color = "white";
        }, holdSectorTimeDuration);
    }

    if (targetTime !== "NO TIME" && completedFirstSector) {
        let totalSectorTimes = 0;
        let totalTargetBestSectorTimes = 0;
        if (sectors[lastSectorIndex].Segments.slice(-1)[0].Status !== 0) currentSectorIndex = lastSectorIndex + 1;
        for (let sectorCounter = currentSectorIndex - 1; sectorCounter >= 0; sectorCounter--) {
            totalSectorTimes += parseLapOrSectorTime(sectors[sectorCounter].Value);
            totalTargetBestSectorTimes += parseLapOrSectorTime(bestTargetTimes.BestSectors[sectorCounter].Value);
        }

        const targetDeltaElement = document.querySelector(`#n${driverNumber} .times .target .top .delta p`);

        const deltaToTargetTime = totalSectorTimes - totalTargetBestSectorTimes;

        targetDelta = deltaToTargetTime >= 0 ? "+" + deltaToTargetTime.toFixed(3) : deltaToTargetTime.toFixed(3);

        const deltaColor =
            deltaToTargetTime >= 0 ? getColorFromStatusCodeOrName("yellow") : getColorFromStatusCodeOrName("green");

        if (targetDeltaElement.textContent != targetDelta) targetDeltaElement.textContent = targetDelta;
        targetDeltaElement.style.color = deltaColor;
    }
}

function setSectors(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const sectors = driverTimingData.Sectors;

    const lastSectorIndex = sectors.length - 1;

    const completedFirstSector =
        (sectors[0].Segments.slice(-1)[0].Status !== 0 && sectors[lastSectorIndex].Value === "") ||
        sectors[lastSectorIndex].Segments.slice(-1)[0].Status !== 0;

    for (let sectorIndex in sectors) {
        const sectorTimeElement = document.querySelector(
            `#n${driverNumber} .sectors #sector${sectorIndex} .sector-times .sector-time p`
        );

        if (completedFirstSector && sectors[sectorIndex].Value != "") {
            if (sectorTimeElement.textContent !== sectors[sectorIndex].Value) {
                sectorTimeElement.textContent = sectors[sectorIndex].Value;
                sectorTimeElement.style.color = getColorFromStatusCodeOrName(
                    sectors[sectorIndex].OverallFastest
                        ? "purple"
                        : sectors[sectorIndex].PersonalFastest
                        ? "green"
                        : "yellow"
                );
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
}

function updateTemplate(driverNumber, pushDrivers) {
    const driverTimingData = timingData[driverNumber];

    const driverElement = document.getElementById(`n${driverNumber}`);

    const elementLapTime = driverElement.lapNumber;

    const currentDriverLap = driverTimingData.NumberOfLaps;

    const lapTimeElement = document.querySelector(`#n${driverNumber} .times .personal p`);

    const lastSectorIndex = driverTimingData.Sectors.length - 1;

    const lastSegmentIndex = driverTimingData.Sectors[lastSectorIndex].Segments.length - 1;

    const lastSegmentElement = document.querySelector(
        `#n${driverNumber} .sectors #sector${lastSectorIndex} .segments #segment${lastSegmentIndex}`
    );

    setPosition(driverNumber);

    if (!pushDrivers.includes(driverNumber)) {
        if (removingDrivers.includes(driverNumber)) return;
        removingDrivers.push(driverNumber);

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
            lapTimeElement.textContent = "BACKED";
            lapTimeElement.style.color = getColorFromStatusCodeOrName("red");
        }

        if (rgbToHex(lastSegmentElement.style.backgroundColor) === getColorFromStatusCodeOrName("gray")) {
            setSectors(driverNumber);
            setTargetInfo(driverNumber);
        }

        setTimeout(() => {
            removeDriver(driverNumber);
        }, holdEndOfLapDuration);

        return;
    }

    setCurrentLapTime(driverNumber);

    setSectors(driverNumber);

    setTargetInfo(driverNumber);
}

run();
