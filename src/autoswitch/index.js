const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");

// Top 6 drivers
const vipDrivers = ["VER", "LEC", "PER", "HAM", "SAI", "RUS"];

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "";
        document.getElementById("container").className = "";
        document.getElementById("wrapper1").className = "wrapper";
        document.getElementById("wrapper2").className = "hidden";
        document.getElementById("hide").style.margin = "Inherited";
        document.getElementById("onboard-count2").style.fontSize = "Inherited";
        window.resizeTo(400, 480);
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

function hide() {
    document.getElementById("container").className = "hidden";
}

function small() {
    window.resizeTo(150, 150);
    document.getElementById("wrapper1").className = "hidden";
    document.getElementById("wrapper2").className = "wrapper";
    document.getElementById("hide").style.margin = "0";
    document.getElementById("onboard-count2").style.fontSize = "25px";
}

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_config")).current;
    const networkConfig = configFile.network;
    mainWindowName = configFile.autoswitcher.main_window_name;

    host = networkConfig.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;

    config = {
        host: host,
        port: port,
    };
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
    const height = bounds.height;
    const width = bounds.width;
    const x = bounds.x;
    const y = bounds.y;

    const newBounds = { height: height, width: width, x: 0, y: -5000 };

    const newWindow = await f1mvApi.createPlayer(config, newDriverNumber, contentId, newBounds, false);

    if (!newWindow.errors) {
        const newWindowId = newWindow.data.playerCreate;

        await sleep(2500);

        await f1mvApi.setSpeedometerVisibility(config, newWindowId, true);

        if (mainWindow === null) mainWindow = oldWindowId;

        await f1mvApi.syncPlayers(config, mainWindow);

        await sleep(3000);

        await f1mvApi.setPlayerBounds(config, newWindowId, { x: x, y: y });

        await f1mvApi.removePlayer(config, oldWindowId);
    } else {
        console.log(newWindow.errors[0].message);
    }
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
    if (sessionStatus === "Aborted" || sessionStatus === "Inactive") return false;

    const driverTimingData = timingData[driverNumber];
    const driverTimingStats = timingStats[driverNumber];

    console.log(driverNumber, driverTimingData.NumberOfLaps);

    if (sessionType === "Race" && (driverTimingData.NumberOfLaps === undefined || driverTimingData.NumberOfLaps <= 1))
        return false;

    if (driverTimingData.InPit) return false;

    // If the first mini sector time is status 2064, meaning he is on a out lap, return false
    if (driverTimingData.Sectors[0].Segments[0].Status === 2064) return false;

    // Get the threshold to which the sector time should be compared to the best personal sector time.
    const pushDeltaThreshold = sessionType === "Race" ? 0.2 : sessionType === "Qualifying" ? 1 : 3;

    const sectors = driverTimingData.Sectors;

    const lastSector = sectors.slice(-1)[0];

    if (sectors.slice(-1)[0].Value !== "" && sectors.slice(-1)[0].Segments.slice(-1)[0].Status !== 0) return false;

    const completedFirstSector =
        (sectors[0].Segments.slice(-1)[0].Status !== 0 && lastSector.Value === "") ||
        (lastSector.Segments.slice(-1)[0].Status === 0 &&
            lastSector.Value !== "" &&
            sectors[1].Segments[0].Status !== 0 &&
            sectors[0].Segments.slice(-1)[0].Status !== 0);

    let isPushing = false;
    for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
        const sector = sectors[sectorIndex];
        const bestSector = driverTimingStats.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        // Check if the first sector is completed by checking if the last segment of the first sector has a value meaning he has crossed the last point of that sector and the final sector time does not have a value. The last check is done because sometimes the segment already has a status but the times are not updated yet.

        if (driverNumber == 63) console.log(completedFirstSector);

        // If the first sector time is above the threshold it should imidiately break because it will not be a push lap
        if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
            isPushing = false;
            break;
        }

        // If the first sector time is lower then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sectorTime - bestSectorTime <= pushDeltaThreshold && completedFirstSector) {
            isPushing = true;
            continue;
        }

        // If the driver has a fastest segment overall it would temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sector.Segments.some((segment) => segment.Status === 2051) && sessionType !== "Race") {
            isPushing = true;
            continue;
        }
    }

    if (driverNumber == 63) console.log(isPushing);

    // Return the final pushing state
    return isPushing;
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
        if (driverTimingData.InPit && driverCarData.Channels[0] <= 5) return true;

        return false;
    }
    // If the value to the car ahead is not nothing or the gap is more than a second and he is not catching. The driver will then be a tertairy driver (if it is after 3 laps from the start)
    if (
        driverIntervalAhead.Value.includes("LAP") ||
        (parseFloat(driverIntervalAhead.Value.substring(1)) > 1 &&
            !driverIntervalAhead.Catching &&
            lapCount.CurrentLap >= 3)
    )
        return true;

    return false;
}

function hiddenDriver(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    if (sessionType === "Qualifying" && driverTimingData.KnockedOut) return true;

    if (driverTimingData.Retired || driverTimingData.Stopped) return true;

    return false;
}

function getCarData(driverNumber) {
    try {
        carData[0].Cars[driverNumber].Channels;
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[driverNumber].Channels;
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

function weirdCarBehaviour(driverCarData, racingNumber) {
    const driverTimingData = timingData[racingNumber];

    const rpm = driverCarData[0];

    const speed = driverCarData[2];

    const gear = driverCarData[3];

    const speedLimit = getSpeedThreshold();

    return (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear ===
            (sessionStatus === "Inactive" ||
            sessionStatus === "Aborted" ||
            (sessionType !== "Race" && driverTimingData.PitOut)
                ? ""
                : 0)
    );
}

function overwriteCrashedStatus(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    if (driverTimingData.InPit || driverTimingData.Retired || driverTimingData.Stopped) return true;

    const lastSectorSegments = driverTimingData.Sectors.slice(-1)[0].Segments;

    const sessionInactive = sessionStatus === "Inactive" || sessionStatus === "Finished";

    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (lastSectorSegments.slice(-2, -1)[0].Status !== 0 && sessionInactive && !driverTimingData.PitOut) {
        console.log(racingNumber + " is lining up for a race start");
        return true;
    }

    // If the race is started and the last mini sector has a different value then 0 (has a value)
    if (
        sessionType === "Race" &&
        sessionStatus === "Started" &&
        lastSectorSegments.slice(-1)[0].Status !== 0 &&
        lapCount.CurrentLap === 1
    ) {
        console.log(racingNumber + " is doing a race start");
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
    if (driverTimingData.InPit && !driverTimingData.Retired && !driverTimingData.Stopped) return true;

    const driverCarData = getCarData(driverNumber);

    if (driverCarData === "error") return false;

    if (!weirdCarBehaviour(driverCarData, driverNumber)) return false;

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
    if (sessionType !== "Race" || prioLog.lap !== lapCount.CurrentLap || prioList.length === 0) {
        prioList = [];
        for (const vip of vipDrivers) {
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
        for (const driver in timingData) {
            if (!prioList.includes(driver)) {
                prioList.push(driver);
            }
        }
    }

    let mvpDrivers = [];
    let primaryDrivers = [];
    let secondaryDrivers = [];
    let tertiaryDrivers = [];
    let hiddenDrivers = [];
    for (const driverNumber of prioList) {
        if (mvpDriver(driverNumber)) mvpDrivers.push(driverNumber);
        else if (hiddenDriver(driverNumber)) hiddenDrivers.push(driverNumber);
        else if (tertiaryDriver(driverNumber)) tertiaryDrivers.push(driverNumber);
        else if (sessionType !== "Race") {
            isDriverOnPushLap(driverNumber) ? primaryDrivers.push(driverNumber) : secondaryDrivers.push(driverNumber);
        } else {
            if (secondaryDriver(driverNumber)) secondaryDrivers.push(driverNumber);
            else if (primaryDriver(driverNumber)) primaryDrivers.push(driverNumber);
        }
    }

    const newList = [...mvpDrivers, ...primaryDrivers, ...secondaryDrivers, ...tertiaryDrivers, ...hiddenDrivers];

    if (sessionType === "Race") {
        prioLog.lap = lapCount.CurrentLap;
        prioLog.drivers = newList;
    }

    return newList;
}

// Runing all function to add the funtionality
async function run() {
    while (true) {
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
        loop1: for (const prioIndex in prioList) {
            const driver = prioList[prioIndex];
            console.log(prioList.slice(0, 1));
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
        await sleep(500);
    }
}

run();
