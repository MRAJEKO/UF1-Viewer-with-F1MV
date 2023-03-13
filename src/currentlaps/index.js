const debug = false;

// The duration of the sector times being show when completing a sector
// (All times are in MS)
const loopspeed = 80;

const f1mvApi = require("npm_f1mv_api");

const { ipcRenderer } = require("electron");

const { isDriverOnPushLap, getDriverPosition } = require("../functions/driver.js");

const { parseLapOrSectorTime, formatMsToF1 } = require("../functions/times.js");

const { getColorFromStatusCodeOrName } = require("../functions/colors.js");

// Apply any configuration from the config.json file
async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_store")).config;
    host = configFile.network.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;

    const configHighlightedDrivers = configFile.general?.highlighted_drivers?.split(",");

    highlightedDrivers = configHighlightedDrivers[0] ? configHighlightedDrivers : [];

    const header = configFile.current_laps?.show_header;

    if (!header) {
        document.getElementById("header").style.display = "none";
        document.getElementById("line").style.display = "none";
    }

    holdSectorTimeDuration = parseInt(configFile.current_laps?.sector_display_duration) ?? 4000;
    holdEndOfLapDuration = parseInt(configFile.current_laps?.end_display_duration) ?? 4000;
}
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
        "TrackStatus",
        "SessionInfo",
        "TopThree",
        "SessionStatus",
    ]);

    driverList = liveTimingState.DriverList;
    tireData = liveTimingState.TimingAppData?.Lines;
    timingData = liveTimingState.TimingData?.Lines;
    qualiTimingData = liveTimingState.TimingData;
    bestTimes = liveTimingState.TimingStats?.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    topThree = liveTimingState.TopThree?.Lines;
    sessionStatus = liveTimingState.SessionStatus?.Status;
    trackStatus = parseInt(liveTimingState.TrackStatus?.Status);

    clockData = liveTimingClock;
}

let backedOutDrivers = [];
// Get the position of all the drivers and sort them accordingly
function getAllPushDriverPositions() {
    let pushDriversPositions = [];

    for (const driverNumber in timingData) {
        if (backedOutDrivers.indexOf(driverNumber) !== -1) continue;

        const isDriverPushing = isDriverOnPushLap(
            sessionStatus,
            trackStatus,
            timingData,
            bestTimes,
            sessionType,
            driverNumber
        );

        if (!isDriverPushing) continue;

        let driverPosition = getDriverPosition(driverNumber, timingData);

        pushDriversPositions.push({ driver: driverNumber, position: driverPosition });
    }

    pushDriversPositions.sort((a, b) => {
        if (a.position === b.position) {
            if (driverLaps[a.driver] && driverLaps[b.driver]) {
                return driverLaps[a.driver].time - driverLaps[b.driver].time;
            }
        }

        if (
            b.driver in driverLaps &&
            a.driver in driverLaps &&
            b.position > a.position &&
            driverLaps[b.driver].time > driverLaps[a.driver].time
        )
            backedOutDrivers.push(a.driver);

        return b.position - a.position;
    });

    const sortedDrivers = pushDriversPositions.map((driverNumber) => driverNumber.driver);

    // Return a array with all the driver numbers that are on a push lap in the order of position on track
    return sortedDrivers;
}

driverLaps = {};
function saveTimeOfNewLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const lastSectorValue = driverTimingData.Sectors.slice(-1)[0].Value;

    const lastStatus = driverTimingData.Sectors.slice(-1)[0].Segments?.slice(-1)[0].Status ?? 0;

    const currentDriverLap = driverTimingData.NumberOfLaps;

    const newLap = lastStatus
        ? lastStatus !== 2064 && lastStatus !== 0 && (driverLaps[driverNumber]?.lap !== currentDriverLap ?? true)
        : lastSectorValue != "" && driverLaps[driverNumber]?.lap !== currentDriverLap;

    if (newLap) {
        const driverIndexInBackedOutDriverList = backedOutDrivers.indexOf(driverNumber);
        if (driverIndexInBackedOutDriverList !== -1) {
            backedOutDrivers.splice(driverIndexInBackedOutDriverList, 1);
        }
        const trackTime = clockData.trackTime;
        const systemTime = clockData.systemTime;
        const now = Date.now();
        const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));
        driverLaps[driverNumber] = { time: localTime, lap: currentDriverLap };
    }
}

function setPosition(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const position = parseInt(driverTimingData.Position);

    const displayedPosition = document.querySelector(`#n${driverNumber} .position p`).textContent;

    if (sessionType === "Qualifying") {
        const sessionPart = qualiTimingData.SessionPart;

        const entries = qualiTimingData.NoEntries[sessionPart] || null;

        const headerElement = document.querySelector(`#n${driverNumber} .position`);

        position > entries ? (headerElement.className = "position danger") : (headerElement.className = "position");
    }

    if (displayedPosition != position) document.querySelector(`#n${driverNumber} .position p`).textContent = position;
}

function setSectors(driverNumber, targetDriverNumber, completedFirstSector) {
    const driverTimingData = timingData[driverNumber];

    const sectors = driverTimingData.Sectors;

    let totalSectorDelta = 0;

    for (const sectorIndex in sectors) {
        const sector = sectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);

        const displaySectorTime = sectorTime.toFixed(3);

        if (!isNaN(sectorTime) && completedFirstSector) {
            const sectorTimeElement = document.querySelector(
                `#n${driverNumber} .sectors #sector${sectorIndex} .sector-times .sector-time p`
            );

            if (sectorTimeElement.textContent !== displaySectorTime) {
                sectorTimeElement.textContent = displaySectorTime;
                sectorTimeElement.style.color = getColorFromStatusCodeOrName(
                    sector.OverallFastest ? "purple" : sector.PersonalFastest ? "green" : "yellow"
                );
            }

            const bestTargetSectorTime = parseLapOrSectorTime(
                bestTimes[targetDriverNumber].BestSectors[sectorIndex].Value
            );

            const bestTargetLapTime = bestTimes[targetDriverNumber].PersonalBestLapTime.Value;

            if (bestTargetLapTime !== "") {
                const sectorDeltaTime = sectorTime - bestTargetSectorTime;

                totalSectorDelta += sectorDeltaTime;

                const displaySectorDelta =
                    sectorDeltaTime < 0 ? sectorDeltaTime.toFixed(3) : `+${sectorDeltaTime.toFixed(3)}`;

                const sectorDeltaColor = getColorFromStatusCodeOrName(sectorDeltaTime < 0 ? "green" : "yellow");

                const sectorDeltaElement = document.querySelector(
                    `#n${driverNumber} .sectors #sector${sectorIndex} .sector-times .sector-delta`
                );

                const sectorDeltaTextElement = sectorDeltaElement.querySelector("p");

                sectorDeltaTextElement.textContent = displaySectorDelta;

                sectorDeltaTextElement.style.color = sectorDeltaColor;

                sectorDeltaElement.style.display = null;
            }
        }

        const segments = sector.Segments;

        if (segments) {
            for (const segmentIndex in segments) {
                const segment = segments[segmentIndex];

                const segmentColor = getColorFromStatusCodeOrName(segment.Status);

                const segmentElement = document.querySelector(
                    `#n${driverNumber} .sectors #sector${sectorIndex} .segments #segment${segmentIndex}`
                );

                segmentElement.style.backgroundColor = segmentColor;
            }
        } else {
            const segmentElement = document.querySelector(
                `#n${driverNumber} .sectors #sector${sectorIndex} .segments #segment${sectorIndex}`
            );

            segmentElement.style.backgroundColor = getColorFromStatusCodeOrName(
                sector.Value === ""
                    ? "gray"
                    : sector.OverallFastest
                    ? "purple"
                    : sector.PersonalFastest
                    ? "green"
                    : "yellow"
            );
        }
    }

    return totalSectorDelta;
}

function getTargetPositionAndNumber(driverNumber) {
    const driverTimingData = timingData[driverNumber];

    const position = driverTimingData.Position;

    let targetPosition = 1;
    if (sessionType === "Practice") {
        targetPosition = position == 1 ? 2 : 1;
    } else if (sessionType === "Qualifying") {
        const sessionPart = qualiTimingData.SessionPart;

        const currentEntries = qualiTimingData.NoEntries[sessionPart];

        const cutoff = currentEntries !== null ? position > currentEntries : false;

        if (cutoff && driverTimingData.BestLapTime.Value === "") {
            targetPosition =
                parseInt(driverTimingData.Position) <= currentEntries ? (position == 1 ? 2 : 1) : currentEntries;
        } else {
            targetPosition = cutoff ? currentEntries : position == 1 ? 2 : 1;
        }
    } else {
        for (const driver in bestTimes) {
            const driverBestLapPosition = bestTimes[driver].PersonalBestLapTime.Position;

            if (driverBestLapPosition === 1) {
                targetPosition = timingData[driver].Position;
            }
        }
    }

    let targetDriverNumber = topThree[0].RacingNumber;
    do {
        for (const driver in timingData) {
            if (timingData[driver].Position == targetPosition) {
                targetDriverNumber = driver;
                break;
            }
        }
        if (targetPosition === 1) break;

        if (bestTimes[targetDriverNumber].PersonalBestLapTime.Value !== "") break;

        targetPosition--;
    } while (bestTimes[targetDriverNumber].PersonalBestLapTime.Value === "");

    if (targetPosition == 1 && position == 1) {
        targetPosition = 2;
        targetDriverNumber = topThree[1].RacingNumber;
    }

    return [targetPosition, targetDriverNumber];
}

function setTargetInfo(
    driverNumber,
    diffToLapStart,
    targetPosition,
    targetDriverNumber,
    completedFirstSector,
    targetDelta
) {
    const driverTimingData = timingData[driverNumber];

    // Set target position
    const targetPositionElement = document.querySelector(`#n${driverNumber} .times .target .bottom .target-position p`);

    targetPositionElement.textContent = `P${targetPosition}`;

    // Set target name
    const targetName = driverList[targetDriverNumber].LastName?.toUpperCase() ?? driverList[targetDriverNumber].Tla;

    const targetNameElement = document.querySelector(`#n${driverNumber} .times .target .bottom .target-name p`);

    targetNameElement.textContent = targetName;

    // Set target time
    const sectors = driverTimingData.Sectors;

    const lastSectorIndex = sectors.length - 1;

    const bestTargetTimes = bestTimes[targetDriverNumber];

    const doesTargetHaveTime = bestTargetTimes.PersonalBestLapTime.Value !== "";

    let currentSectorIndex = 0;
    if (completedFirstSector) {
        for (const sectorIndex in sectors) {
            const sector = sectors[sectorIndex];

            if (sector.Value === "" || sector.Segments?.slice(-1)[0] === 0 || currentSectorIndex === lastSectorIndex)
                break;

            currentSectorIndex++;
        }
    }

    let targetTime = "NO TIME";
    let targetDisplayTime = "NO TIME";
    let targetColor = getColorFromStatusCodeOrName("gray");

    let currentTotalSectorTimes = 0;
    if (doesTargetHaveTime) {
        targetTime = 0;
        for (let sectorIndex = 0; sectorIndex <= currentSectorIndex; sectorIndex++) {
            const targetSectorTime = parseLapOrSectorTime(bestTargetTimes.BestSectors[sectorIndex].Value);

            targetColor = getColorFromStatusCodeOrName("white");

            targetTime += targetSectorTime;

            if (sectorIndex < currentSectorIndex) currentTotalSectorTimes += targetSectorTime;
        }
        targetDisplayTime = formatMsToF1(targetTime * 1000, 3);
    }

    const msPastSector = diffToLapStart
        ? (diffToLapStart / 1000 - currentTotalSectorTimes) * 1000
        : holdSectorTimeDuration + 1;

    const targetTimeElement = document.querySelector(`#n${driverNumber} .times .target .top .target-time p`);

    if (targetTimeElement.textContent !== targetDisplayTime && msPastSector >= holdSectorTimeDuration) {
        targetTimeElement.textContent = targetDisplayTime;
        targetTimeElement.style.color = targetColor;
    }

    let deltaColor = getColorFromStatusCodeOrName("gray");
    if (completedFirstSector && doesTargetHaveTime) {
        deltaColor = targetDelta >= 0 ? getColorFromStatusCodeOrName("yellow") : getColorFromStatusCodeOrName("green");

        targetDelta = targetDelta >= 0 ? `+${targetDelta.toFixed(3)}` : targetDelta.toFixed(3);
    } else {
        targetDelta = "NO DELTA";
    }
    const targetDeltaElement = document.querySelector(`#n${driverNumber} .times .target .top .delta p`);

    if (targetDeltaElement.textContent !== targetDelta) {
        targetDeltaElement.textContent = targetDelta;
        targetDeltaElement.style.color = deltaColor;
    }
}

function setCurrentLapTime(driverNumber, diffToLapStart, isPushing) {
    const driverTimingData = timingData[driverNumber];

    const driverSectorData = driverTimingData.Sectors;

    let totalSectorTimes = 0;
    let previousSectorIndex = 0;
    for (const sectorIndex in driverSectorData) {
        const sector = driverSectorData[sectorIndex];

        if (sector.Value === "" || sector.Segments?.slice(-1)[0] === 0) break;

        const sectorTime = parseLapOrSectorTime(sector.Value);

        totalSectorTimes += sectorTime;

        previousSectorIndex = sectorIndex;
    }

    const lapTimeElement = document.querySelector(`#n${driverNumber} .times .personal p`);

    const currentDriverLap = driverTimingData.NumberOfLaps;

    if (diffToLapStart) {
        const msPastSector = (diffToLapStart / 1000 - totalSectorTimes) * 1000;

        let displayTime = formatMsToF1(diffToLapStart, 1);

        let color = getColorFromStatusCodeOrName("white");

        if (totalSectorTimes !== 0 && msPastSector <= holdSectorTimeDuration) {
            const previousSector = driverSectorData[previousSectorIndex];
            displayTime = formatMsToF1(totalSectorTimes * 1000, 3);
            color = getColorFromStatusCodeOrName(
                previousSector.OverallFastest ? "purple" : previousSector.PersonalFastest ? "green" : "yellow"
            );
        }

        lapTimeElement.textContent = displayTime;
        lapTimeElement.style.color = color;
    } else if (!isPushing) {
        const elementLapTime = parseInt(document.getElementById(`n${driverNumber}`).dataset.lapNumber);

        if (driverTimingData.InPit && elementLapTime === currentDriverLap) {
            lapTimeElement.textContent = "IN PIT";
            lapTimeElement.style.color = getColorFromStatusCodeOrName("red");
        } else {
            const segmentsAvailable = driverTimingData.Sectors[0].Segments;
            if (
                segmentsAvailable
                    ? driverTimingData.Sectors.slice(-1)[0].Segments.slice(-1)[0].Status !== 0
                    : driverTimingData.Sectors.slice(-1)[0] !== 0
            ) {
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
        }
    }
}

function updateTemplate(driverNumber, pushDrivers) {
    const driverTimingData = timingData[driverNumber];

    const sectors = driverTimingData.Sectors;

    const lastSector = sectors.slice(-1)[0];

    const completedFirstSector = sectors[0].Segments
        ? (sectors[0].Segments.slice(-1)[0].Status !== 0 && lastSector.Value === "") ||
          (lastSector.Segments.slice(-1)[0].Status === 0 &&
              lastSector.Value !== "" &&
              sectors[1].Segments[0].Status !== 0 &&
              sectors[0].Segments.slice(-1)[0].Status !== 0)
        : sectors[0].Value !== 0 && lastSector.Value === "";

    const driverElement = document.getElementById(`n${driverNumber}`);

    const trackTime = clockData.trackTime;
    const systemTime = clockData.systemTime;
    const now = Date.now();
    const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

    const timeDiff = driverLaps[driverNumber] ? localTime - driverLaps[driverNumber].time : false;

    const isPushing = pushDrivers.includes(driverNumber);

    setPosition(driverNumber);

    if (!isPushing) {
        if (removingDrivers.includes(driverNumber)) return;

        removingDrivers.push(driverNumber);

        const [targetPosition, targetDriverNumber] = getTargetPositionAndNumber(driverNumber);

        const targetDelta = setSectors(driverNumber, targetDriverNumber, true);

        setCurrentLapTime(driverNumber, false, isPushing);

        setTargetInfo(driverNumber, timeDiff, targetPosition, targetDriverNumber, true, targetDelta);

        console.log(`Removing ${driverNumber} from list`);

        driverElement.dataset.finished = true;

        setTimeout(() => {
            removeDriver(driverNumber);
        }, holdEndOfLapDuration);

        return;
    }

    const [targetPosition, targetDriverNumber] = getTargetPositionAndNumber(driverNumber);

    const targetDelta = setSectors(driverNumber, targetDriverNumber, completedFirstSector);

    setCurrentLapTime(driverNumber, timeDiff, isPushing);

    setTargetInfo(driverNumber, timeDiff, targetPosition, targetDriverNumber, completedFirstSector, targetDelta);
}

let removingDrivers = [];
function removeDriver(driverNumber) {
    const driverElement = document.getElementById(`n${driverNumber}`);
    driverElement.classList.remove("show");

    setTimeout(() => {
        driverElement.remove();
        const driverNumberIndex = removingDrivers.indexOf(driverNumber);
        removingDrivers.splice(driverNumberIndex, 1);
    }, 500);
}

// Initiate HTML element for a driver's pushlap
async function initiateTemplate(driverNumber, pushDrivers) {
    const container = document.getElementById("container");

    if (container.querySelector(`#n${driverNumber}`) !== null) return;

    const driverTimingData = timingData[driverNumber];

    const noTimeColor = getColorFromStatusCodeOrName("gray");

    // Defining all header information
    const teamColor = "#" + driverList[driverNumber].TeamColour;

    const teamIcon = (await ipcRenderer.invoke("get_store")).team_icons[driverList[driverNumber].TeamName];

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
        if (driverSegmentData) {
            for (let count = 0; count < driverSegmentData.length; count++) {
                const HTMLSegment = `<div class="segment" id="segment${count}" style="background-color: ${noTimeColor}"></div>`;
                segments += HTMLSegment;
            }
        } else {
            const HTMLSegment = `<div class="segment" id="segment${sectorIndex}" style="background-color: ${noTimeColor}"></div>`;
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

    const driverTla = driverList[driverNumber]?.Tla;

    if (highlightedDrivers.includes(driverTla)) listItem.classList.add("highlight");

    listItem.dataset.lapNumber = currentLap;
    listItem.dataset.finished = false;

    pushDriverIndex = pushDrivers.indexOf(driverNumber);

    for (let elementIndex = 0; elementIndex < container.children.length; elementIndex++) {
        const child = container.children[elementIndex];

        if (child.dataset.finished === "true") pushDriverIndex++;
    }

    const beforeElement = container.children[pushDriverIndex];

    container.insertBefore(listItem, beforeElement);

    setTimeout(() => {
        listItem.classList.add("show");
    }, 10);
}

const { getDriversTrackOrder } = require("../functions/driver.js");

// Run all function and create a loop to refresh
async function run() {
    await getConfigurations();
    setInterval(async () => {
        await apiRequests();
        const pushDrivers = getAllPushDriverPositions();
        // Check for every driver if he is pushing and then initiate a template
        for (const driver of pushDrivers) {
            await initiateTemplate(driver, pushDrivers);
        }
        const container = document.getElementById("container").children;

        // Update the template for every item inside of the container
        for (const child of container) {
            const driverNumber = child.id.substring(1);

            updateTemplate(driverNumber, pushDrivers);
        }

        // Save the current time when a lap get started by a driver
        for (const driver in timingData) {
            saveTimeOfNewLap(driver);
        }
    }, loopspeed);
}
run();
