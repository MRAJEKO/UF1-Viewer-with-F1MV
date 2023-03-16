const debug = false;

const f1mvApi = require("npm_f1mv_api");

const { ipcRenderer } = require("electron");

const { isDriverOnPushLap } = require("../functions/driver.js");

const { weirdCarBehaviour } = require("../functions/car.js");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let size = 0;
function toggleSize() {
    if (document.getElementById("background").classList.value.includes("drag")) {
    } else {
        if (size === 1) {
            window.resizeTo(400, 480);
            size = 0;
            document.getElementById("container").className = "";
            document.getElementById("wrapper1").className = "wrapper";
            document.getElementById("wrapper2").className = "hidden";
            document.getElementById("hide").style.margin = "Inherited";
            document.getElementById("onboard-count2").style.fontSize = "Inherited";
        }
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        toggleSize();
    }
});

function hide() {
    document.getElementById("container").className = "hidden";
    size = 1;
}

function small() {
    window.resizeTo(150, 150);
    document.getElementById("wrapper1").className = "hidden";
    document.getElementById("wrapper2").className = "wrapper";
    document.getElementById("hide").style.margin = "0";
    document.getElementById("onboard-count2").style.fontSize = "25px";
    size = 1;
}

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_store")).config;
    const networkConfig = configFile.network;
    mainWindowName = configFile.autoswitcher.main_window_name;
    enableSpeedometer = configFile.autoswitcher.speedometer;

    const configHighlightedDrivers = configFile.general?.highlighted_drivers?.split(",");

    highlightedDrivers = configHighlightedDrivers[0] ? configHighlightedDrivers : [];

    const configFixedDrivers = configFile.autoswitcher?.fixed_drivers?.split(",");

    fixedDrivers = configFixedDrivers[0] ? configFixedDrivers : [];

    host = networkConfig.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;

    config = {
        host: host,
        port: port,
    };
}

async function enableSpeedometers() {
    const data = await f1mvApi.getAllPlayers(config);
    for (const window of data) {
        if (window.driverData !== null) {
            await f1mvApi.setSpeedometerVisibility(config, window.id, true);
        }
    }
}

// Receive all the API endpoints
if (debug) console.log(sessionType);
async function apiRequests() {
    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "CarData",
        "DriverList",
        "SessionData",
        "SessionInfo",
        "SessionStatus",
        "TimingData",
        "TimingStats",
        "TrackStatus",
        "LapCount",
    ]);
    if (debug) console.log(liveTimingState);
    carData = liveTimingState.CarData.Entries;
    driverList = liveTimingState.DriverList;
    sessionData = liveTimingState.SessionData;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    sessionStatus = liveTimingState.SessionStatus.Status;
    timingData = liveTimingState.TimingData.Lines;
    timingStats = liveTimingState.TimingStats.Lines;
    trackStatus = liveTimingState.TrackStatus;
    lapCount = liveTimingState.LapCount;
}

async function getAllPlayers() {
    let shownDrivers = {};
    let playerCount = 0;
    let mainWindow = null;

    const data = await f1mvApi.getAllPlayers(config);

    for (const window of data) {
        if (mainWindow === null && window.driverData === null && window.streamData.title === mainWindowName) {
            mainWindow = parseInt(window.id);
        } else if (window.driverData !== null) {
            shownDrivers[window.driverData.driverNumber] = parseInt(window.id);
            playerCount++;
        }
    }

    if (data.length === 0) return false;

    if (mainWindow === null) console.log("Could not find main window. Using onboards to sync instead.");

    const contentId = parseInt(data[0].streamData.contentId);

    return [playerCount, shownDrivers, mainWindow, contentId];
}

async function replaceWindow(oldWindowId, newDriverNumber, contentId, mainWindow) {
    console.log(mainWindow);

    const bounds = await f1mvApi.getPlayerBounds(config, oldWindowId);

    const newWindow = await f1mvApi.createPlayer(config, newDriverNumber, contentId, bounds, false);

    if (!newWindow.errors) {
        const newWindowId = newWindow.data.playerCreate;

        await sleep(2500);

        if (enableSpeedometer) await f1mvApi.setSpeedometerVisibility(config, newWindowId, true);

        if (mainWindow === null) mainWindow = oldWindowId;

        await f1mvApi.syncPlayers(config, mainWindow);

        await sleep(3000);

        await f1mvApi.setAlwaysOnTop(config, newWindowId, true, "FLOATING");

        await f1mvApi.removePlayer(config, oldWindowId);
    } else {
        console.log(newWindow.errors[0].message);
    }
}

function primaryDriver(racingNumber) {
    const driverIntervalAhead = timingData[racingNumber].IntervalToPositionAhead.Value;

    if (lapCount.CurrentLap < 3) return true;

    if (driverIntervalAhead !== "" && parseFloat(driverIntervalAhead.substring(1)) <= 1) return true;

    return false;
}

function secondaryDriver(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    const driverIntervalAhead = driverTimingData.IntervalToPositionAhead;

    if (
        driverIntervalAhead.Value != "" &&
        parseFloat(driverIntervalAhead.Value.substring(1)) > 1 &&
        driverIntervalAhead.Catching
    ) {
        // If the value to the car ahead is not nothing and is bigger than 1 second and the car is catching. The driver will then be a secondary driver (if it is after 3 laps from the start)
        if (lapCount.CurrentLap >= 3) {
            if (!driverIntervalAhead.Value.includes("LAP")) return true;

            return false;
        }
    }
    return false;
}

function tertiaryDriver(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    const driverIntervalAhead = driverTimingData.IntervalToPositionAhead;

    const driverCarData = carData[0].Cars[racingNumber];

    if (sessionType !== "Race") {
        // If the session is a Practice or Qualifying session

        console.log(driverTimingData);

        if (driverTimingData.InPit && driverCarData.Channels[0] <= 5) return true;

        return false;
    }
    // If the value to the car ahead is not nothing or the gap is more than a second and he is not catching. The driver will then be a tertairy driver (if it is after 3 laps from the start)
    if (
        (driverIntervalAhead.Value.includes("LAP") ||
            (parseFloat(driverIntervalAhead.Value.substring(1)) > 1 && !driverIntervalAhead.Catching)) &&
        lapCount.CurrentLap >= 3
    ) {
        return true;
    }

    if (sessionType === "Race") {
        const numberOfLaps = driverIntervalAhead.Value.includes("L")
            ? parseInt(driverIntervalAhead.Value.split(" ")[0]) + driverTimingData.NumberOfLaps
            : driverTimingData.NumberOfLaps;
        console.log(racingNumber, numberOfLaps, lapCount.CurrentLap);
        if (["Finished", "Finalised"].includes(sessionStatus) && numberOfLaps === lapCount.CurrentLap) return true;
    }

    return false;
}

function hiddenDriver(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    if (sessionType === "Qualifying" && driverTimingData.KnockedOut) return true;

    if (driverTimingData.Retired || driverTimingData.Stopped) return true;

    return false;
}

function getSpeedThreshold() {
    if (
        sessionType === "Qualifying" ||
        sessionType === "Practice" ||
        trackStatus.Status === "4" ||
        trackStatus.Status === "6" ||
        trackStatus.Status === "7"
    )
        return 10;
    if (sessionStatus === "Inactive" || sessionStatus === "Aborted") return 0;
    return 30;
}

function overwriteCrashedStatus(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    if (driverTimingData.InPit || driverTimingData.Retired || driverTimingData.Stopped) return true;

    const lastSectorSegments = driverTimingData.Sectors.slice(-1)[0].Segments;

    const sessionInactive = sessionStatus === "Inactive" || sessionStatus === "Finished";

    if (!lastSectorSegments && sessionInactive) return true;

    if (!lastSectorSegments) return false;

    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (
        sessionType === "Race" &&
        (lastSectorSegments.slice(-3).some((segment) => segment.Status !== 0) ||
            driverTimingData.Sectors[0].Segments[1].Status === 0) &&
        lapCount.CurrentLap === 1 &&
        !driverTimingData.PitOut
    ) {
        console.log(racingNumber + " is on the starting grid");
        return true;
    }

    // Detect if car is in parc ferme
    // If the car has stopped anywhere in the final sector and the 'race' has 'finished'
    if (
        sessionType === "Race" &&
        sessionStatus === "Finished" &&
        lastSectorSegments.some((segment) => segment.Status !== 0)
    ) {
        console.log(racingNumber + " is in parc ferme");
        return true;
    }

    return false;
}

function driverIsImportant(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    if (
        driverTimingData.InPit &&
        sessionType === "Race" &&
        sessionStatus === "Started" &&
        !driverTimingData.Retired &&
        !driverTimingData.Stopped
    )
        return true;

    if (!weirdCarBehaviour(driverNumber, timingData, carData, sessionType, sessionStatus, trackStatus)) return false;

    if (overwriteCrashedStatus(driverNumber)) return false;

    return true;
}

function mvpDriver(driverNumber) {
    if (sessionType === "Race") {
        if (lapCount.CurrentLap === mvpLog.lap) {
            if (mvpLog.drivers.includes(driverNumber)) {
                return true;
            }
        } else {
            mvpLog.lap = lapCount.CurrentLap;
            mvpLog.drivers = [];
        }
    }
    const important = driverIsImportant(driverNumber);

    if (important && sessionType === "Race" && !mvpLog.drivers.includes(driverNumber)) {
        mvpLog.drivers.push(driverNumber);
    }

    return important;
}

let prioLog = { lap: 1, drivers: [] };
let mvpLog = { lap: 1, drivers: [] };
async function setPriorities() {
    // Setting the prio list to the old list that was inside prioLog -> drivers
    let prioList = prioLog.drivers;

    // If the session is not a race or the lap that the priolist is set is not equal to the current racing lap or the priolist is empty
    // Create a new list using the vip drivers and all other drivers in timing data (sorted on racing number)

    fixedDrivers = fixedDrivers.map((driver) => {
        for (const driverNumber in driverList) {
            if (driverList[driverNumber].Tla === driver) {
                const driverTimingData = timingData[driverNumber];

                if (!driverTimingData.Retired && !driverTimingData.Stopped) return driverNumber;
            }
        }
    });

    if (!fixedDrivers[0]) fixedDrivers = [];

    console.log(fixedDrivers);

    if (
        sessionType !== "Race" ||
        sessionStatus === "Finished" ||
        prioLog.lap !== lapCount.CurrentLap ||
        prioList.length === 0
    ) {
        prioList = [];
        for (const vip of highlightedDrivers) {
            for (const driver in driverList) {
                const driverTla = driverList[driver].Tla;

                const driverRaceNumber = driverList[driver].RacingNumber;

                if (vip === driverTla) {
                    console.log(driverTla);

                    prioList.push(driverRaceNumber);
                    break;
                }
            }
        }
        // Fill the rest of the prio list with all drivers inside of timing data that are not already in the list (are vip drivers)
        for (position = 1; position <= Object.values(timingData).length; position++) {
            for (const driver in timingData) {
                const driverTimingData = timingData[driver];

                console.log(driver, driverTimingData.Position, position);
                if (parseInt(driverTimingData.Position) === parseInt(position) && !prioList.includes(driver))
                    prioList.push(driver);
            }
        }
    }
    console.log(prioList);

    let mvpDrivers = [];
    let primaryDrivers = [];
    let secondaryDrivers = [];
    let tertiaryDrivers = [];
    let hiddenDrivers = [];

    for (const driverNumber of prioList) {
        if (fixedDrivers.includes(driverNumber)) continue;

        if (mvpDriver(driverNumber)) mvpDrivers.push(driverNumber);
        else if (hiddenDriver(driverNumber)) hiddenDrivers.push(driverNumber);
        else if (tertiaryDriver(driverNumber)) tertiaryDrivers.push(driverNumber);
        else if (sessionType !== "Race") {
            isDriverOnPushLap(sessionStatus, trackStatus, timingData, timingStats, sessionType, driverNumber)
                ? primaryDrivers.push(driverNumber)
                : secondaryDrivers.push(driverNumber);
        } else {
            if (secondaryDriver(driverNumber)) secondaryDrivers.push(driverNumber);
            else if (primaryDriver(driverNumber)) primaryDrivers.push(driverNumber);
        }
    }

    console.log(fixedDrivers);
    console.log(mvpDrivers);
    console.log(primaryDrivers);
    console.log(secondaryDrivers);
    console.log(tertiaryDrivers);
    console.log(hiddenDrivers);

    const newList = [
        ...fixedDrivers,
        ...mvpDrivers,
        ...primaryDrivers,
        ...secondaryDrivers,
        ...tertiaryDrivers,
        ...hiddenDrivers,
    ];

    if (sessionType === "Race") {
        prioLog.lap = lapCount.CurrentLap;
        prioLog.drivers = newList;
    }

    return newList;
}

// Runing all function to add the funtionality
async function run() {
    await getConfigurations();
    if (enableSpeedometer) await enableSpeedometers();

    while (true) {
        await sleep(500);
        await getConfigurations();
        await apiRequests();
        const videoData = await getAllPlayers();
        if (videoData === false) {
            document.getElementById("onboard-count").textContent = "0";
            document.getElementById("onboard-count2").textContent = "0";
            continue;
        }

        const windowAmount = videoData[0];

        document.getElementById("onboard-count").textContent = windowAmount;

        document.getElementById("onboard-count2").textContent = windowAmount;

        if (windowAmount === 0) continue;

        const shownDrivers = videoData[1];
        const mainWindowId = videoData[2];
        const contentId = videoData[3];

        const prioList = await setPriorities();
        // console.log(prioList);
        loop1: for (const prioIndex in prioList) {
            const driver = prioList[prioIndex];
            if (prioIndex < windowAmount) {
                if (!shownDrivers[driver]) {
                    for (const shownDriver in shownDrivers) {
                        if (!prioList.slice(0, windowAmount).includes(shownDriver)) {
                            console.log("Replace " + shownDriver + " with " + driver);

                            const oldWindowId = shownDrivers[shownDriver];

                            await replaceWindow(oldWindowId, driver, contentId, mainWindowId);

                            await sleep(1000);

                            break loop1;
                        }
                    }
                }
            } else {
                break;
            }
        }
    }
}

run();
