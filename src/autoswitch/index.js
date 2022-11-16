const { ensureDir } = require("fs-extra");
const { ipcRenderer } = require("electron");

const debug = false;

// Top 6 drivers
// const vipDrivers = [1, 16, 11, 44, 55, 63];

// Drivers leaving the season and final battles for the standings
const vipDrivers = [5, 3, 6, 47, 11, 16, 1, 44];

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

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

// Receive all the API endpoints
if (debug) console.log(sessionType);
let carData;
let lapCount;
let driverList;
let sessionData;
let sessionInfo;
let sessionStatus;
let timingData;
let timingStats;
let trackStatus;
async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query LiveTimingState {
      liveTimingState {
        TrackStatus
        TimingData
        TimingStats
        SessionStatus
        SessionInfo
        LapCount
        CarData
        DriverList
        SessionData
      }
    }`,
                    operationName: "LiveTimingState",
                }),
                method: "POST",
            })
        ).json()
    ).data.liveTimingState;
    if (debug) console.log(api);
    carData = api.CarData.Entries;
    driverList = api.DriverList;
    sessionData = api.SessionData;
    sessionInfo = api.SessionInfo;
    sessionType = sessionInfo.Type;
    sessionStatus = api.SessionStatus.Status;
    timingData = api.TimingData.Lines;
    timingStats = api.TimingStats.Lines;
    trackStatus = api.TrackStatus;
    if (sessionType == "Race") {
        lapCount = api.LapCount;
    }
    if (debug) {
        console.log(carData);
        console.log(lapCount);
        console.log(driverList);
        console.log(sessionData);
        console.log(sessionInfo);
        console.log(sessionType);
        console.log(sessionStatus);
        console.log(timingData);
        console.log(timingStats);
        console.log(trackStatus);
    }
}

function getDriverName(number) {
    if (debug) {
    }
    return (
        driverList[number].FirstName +
        " " +
        driverList[number].LastName.toUpperCase()
    );
}

async function getPlayerBounds(id) {
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `query Player($playerId: ID!) {
                player(id: $playerId) {
                  bounds {
                    height
                    width
                    x
                    y
                  }
                }
              }`,
            variables: { playerId: id },
            operationName: "Player",
        }),
        method: "POST",
    });
    const data = (await response.json()).data.player.bounds;
    if (debug) console.log(data);
    return data;
}

let channelId;
let mainWindow;
async function getAllPlayers() {
    let shownDrivers = {};
    let playerAmount = 0;
    const result = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `query DriverData {
                    players {
                      driverData {
                        driverNumber
                      }
                      id
                      streamData {
                        contentId
                        title
                      }
                    }
                  }`,
            variables: {},
            operationName: "DriverData",
        }),
        method: "POST",
    });
    const data = (await result.json()).data.players;
    if (debug) console.log(data);
    for (i in data) {
        if (data[i].driverData != null) {
            shownDrivers[data[i].driverData.driverNumber] = data[i].id;
            playerAmount++;
        } else {
            if (mainWindow == undefined) {
                mainWindow = data[i].id;
            }
        }
    }
    channelId = data[0].streamData.contentId;
    if (debug) {
        console.log(driverInfo);
        console.log(shownDrivers);
        console.log(playerAssignment);
        console.log(channelId);
    }
    return [playerAmount, shownDrivers];
}

async function setSpeedometerVisibility(id) {
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `mutation PlayerSetSpeedometerVisibility($playerSetSpeedometerVisibilityId: ID!, $visible: Boolean) {
                playerSetSpeedometerVisibility(id: $playerSetSpeedometerVisibilityId, visible: $visible)
              }`,
            variables: {
                playerSetSpeedometerVisibilityId: id,
                visible: true,
            },
            operationName: "PlayerSetSpeedometerVisibility",
        }),
        method: "POST",
    });

    const data = await response.json();

    if (debug) console.log(data);
}

async function syncWithOther(shownDrivers) {
    let syncPlayer;
    if (mainWindow != undefined) {
        syncPlayer = mainWindow;
    } else {
        for (i in shownDrivers) {
            syncPlayer = shownDrivers[i];
        }
    }
    console.log(syncPlayer);
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `mutation PlayerSync($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
              }`,
            variables: {
                playerSyncId: syncPlayer,
            },
            operationName: "PlayerSync",
        }),
        method: "POST",
    });

    const data = await response.json();

    if (debug) console.log(data);
}

async function createWindow(shownDrivers, oldDriver, newDriver) {
    const browserWindowId = shownDrivers[oldDriver];
    const bounds = await getPlayerBounds(browserWindowId);
    const height = bounds.height;
    const width = bounds.width;
    if (debug) {
        console.log(height);
        console.log(width);
    }
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `mutation PlayerCreate($input: PlayerCreateInput!) {
                playerCreate(input: $input)
              }`,
            variables: {
                input: {
                    bounds: {
                        height: height,
                        width: width,
                        x: 0,
                        y: -5000,
                    },
                    contentId: channelId,
                    driverNumber: newDriver,
                    maintainAspectRatio: false,
                },
            },
            operationName: "PlayerCreate",
        }),
        method: "POST",
    });

    return await response.json();
}

async function showNewWindow(shownDrivers, oldDriver, newId) {
    const browserWindowId = newId;
    const oldBrowserWindowId = shownDrivers[oldDriver];
    const bounds = await getPlayerBounds(oldBrowserWindowId);
    const x = bounds.x;
    const y = bounds.y;
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `mutation PlayerSetBounds($playerSetBoundsId: ID!, $bounds: RectangleInput!) {
                playerSetBounds(id: $playerSetBoundsId, bounds: $bounds) {
                  x
                  y
                }
              }`,
            variables: {
                playerSetBoundsId: browserWindowId,
                bounds: {
                    x: x,
                    y: y,
                },
            },
            operationName: "PlayerSetBounds",
        }),
        method: "POST",
    });

    const data = await response.json();
    if (debug) console.log(data);
}

async function removeWindow(shownDrivers, oldDriver) {
    const browserWindowId = shownDrivers[oldDriver];
    const response = await fetch(`http://${host}:${port}/api/graphql`, {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: `mutation PlayerDelete($playerDeleteId: ID!) {
                playerDelete(id: $playerDeleteId)
              }`,
            variables: {
                playerDeleteId: browserWindowId,
            },
            operationName: "PlayerDelete",
        }),
        method: "POST",
    });

    return await response.json();
}

async function replaceWindow(shownDrivers, oldDriver, newDriver) {
    console.log("Replacing " + oldDriver + " with " + newDriver);

    const newWindow = await createWindow(shownDrivers, +oldDriver, +newDriver);

    await sleep(1000);

    await setSpeedometerVisibility(newWindow.data.playerCreate);

    await syncWithOther(shownDrivers);

    await sleep(2000);

    await showNewWindow(shownDrivers, oldDriver, newWindow.data.playerCreate);

    await removeWindow(shownDrivers, oldDriver);

    console.log("Replaced " + oldDriver + " with " + newDriver);

    if (debug) {
        console.log(newWindow);
        console.log(driverInfo);
    }
}

function primaryDriver(racingNumber) {
    if (sessionType != "Race") {
        // If the session is a Practice or Qualifying session
        return true;
    }
    if (!lapCount.CurrentLap >= 3) {
        return true;
    }
    if (
        timingData[racingNumber].IntervalToPositionAhead.Value != "" &&
        +timingData[racingNumber].IntervalToPositionAhead.Value.substring(1) <=
            1
    ) {
        return true;
    }
    return false;
}

function secondaryDriver(racingNumber) {
    if (sessionType != "Race") {
        // If the session is a Practice or Qualifying session
        if (
            (timingData[racingNumber].Sectors[0].Segments[0].Status == 2064 ||
                timingData[racingNumber].PitOut) &&
            !(
                timingData[racingNumber].InPit &&
                carData[0].Cars[racingNumber].Channels[2] <= 5
            )
        ) {
            // If the first mini sector is 2064 (pit out) or pitout is true and the driver is not in the pit. The driver will then be on a outlap and is a secondary driver
            return true;
        }
        return false;
    }
    if (
        timingData[racingNumber].IntervalToPositionAhead.Value != "" ||
        (+timingData[racingNumber].IntervalToPositionAhead.Value.substring(1) >
            1 &&
            timingData[racingNumber].IntervalToPositionAhead.Catching)
    ) {
        // If the value to the car ahead is not nothing and is bigger than 1 second and the car is catching. The driver will then be a secondary driver (if it is after 3 laps from the start)
        if (lapCount.CurrentLap >= 3) {
            if (
                !timingData[
                    racingNumber
                ].IntervalToPositionAhead.Value.includes("LAP")
            ) {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
}

function tertiaryDriver(racingNumber) {
    if (sessionType != "Race") {
        // If the session is a Practice or Qualifying session
        if (
            timingData[racingNumber].InPit &&
            carData[0].Cars[racingNumber].Channels[2] <= 5
        ) {
            return true;
        }
        return false;
    }
    if (
        timingData[racingNumber].IntervalToPositionAhead.Value == "" ||
        (+timingData[racingNumber].IntervalToPositionAhead.Value.substring(1) >
            1 &&
            !timingData[racingNumber].IntervalToPositionAhead.Catching)
    ) {
        // If the value to the car ahead is not nothing or the gap is more than a second and he is not catching. The driver will then be a tertairy driver (if it is after 3 laps from the start)
        if (lapCount.CurrentLap >= 3) {
            return true;
        }
    }
    return false;
}

function hiddenDriver(racingNumber) {
    if (sessionType == "Qualifying") {
        if (timingData[racingNumber].KnockedOut) {
            return true;
        }
    }
    if (timingData[racingNumber].Retired || timingData[racingNumber].Stopped) {
        return true;
    }
    return false;
}

let prioLog = { lap: 1, drivers: [] };
async function setPriorities(players) {
    // Setting the prio list to the old list that was inside prioLog -> drivers
    let prioList = prioLog.drivers;
    // If the session is not a race or the lap that the priolist is set is not equal to the current racing lap or the priolist is empty
    // Create a new list using the vip drivers and all other drivers in timing data (sorted on racing number)
    if (
        sessionType != "Race" ||
        prioLog.lap != lapCount.CurrentLap ||
        prioList.length == 0
    ) {
        prioList = [];
        console.log("New list");
        // Put the vipDrivers first
        for (vip in vipDrivers) {
            prioList[vip] = vipDrivers[vip].toString();
        }
        // Fill the rest of the prio list with all drivers inside of timing data that are not already in the list (are vip drivers)
        for (driver in timingData) {
            if (!prioList.includes(driver)) {
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
    for (i in prioList) {
        let driver = prioList[i];
        if (getCurrentExceptions(driver)) {
            if (!mvpLog.drivers.includes(driver)) {
                mvpLog.drivers.push(driver);
            }
            mvpDrivers.push(driver);
            continue;
        }
        if (hiddenDriver(driver)) {
            hiddenDrivers.push(driver);
            continue;
        }

        if (tertiaryDriver(driver)) {
            tertiaryDrivers.push(driver);
            continue;
        }

        if (secondaryDriver(driver)) {
            secondaryDrivers.push(driver);
            continue;
        }

        if (primaryDriver(driver)) {
            primaryDrivers.push(driver);
            continue;
        }
    }
    prioList = mvpDrivers.concat(
        primaryDrivers,
        secondaryDrivers,
        tertiaryDrivers,
        hiddenDrivers
    );
    if (sessionType == "Race") {
        prioLog.lap = lapCount.CurrentLap;
        prioLog.drivers = prioList;
    }
    console.log(mvpDrivers);
    console.log(primaryDrivers);
    console.log(secondaryDrivers);
    console.log(tertiaryDrivers);
    console.log(hiddenDrivers);
    console.log(prioList);
    return prioList;
}

function getCarData(number) {
    try {
        carData[0].Cars[number].Channels;
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[number].Channels;
}

function getSpeedLimit() {
    if (
        sessionType == "Qualifying" ||
        sessionType == "Practice" ||
        sessionStatus == "Inactive" ||
        sessionStatus == "Aborted" ||
        trackStatus.Status == "4" ||
        trackStatus.Status == "6" ||
        trackStatus.Status == "7"
    ) {
        return 10;
    }
    return 30;
}

let mvpLog = { lap: 1, drivers: [] };
function whatHappended(racingNumber) {
    // If someone pits during a race
    if (
        sessionType == "Race" &&
        (timingData[racingNumber].InPit || timingData[racingNumber].PitOut) &&
        sessionStatus == "Started" &&
        lapCount.CurrentLap > 1
    ) {
        console.log(racingNumber + " had gone into the pitlane");
        return true;
    }
    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (
        timingData[racingNumber].Sectors[
            +timingData[racingNumber].Sectors.length - 1
        ].Segments[
            +timingData[racingNumber].Sectors[
                +timingData[racingNumber].Sectors.length - 1
            ].Segments.length - 2
        ].Status != 0 &&
        ((sessionStatus == "Inactive" && sessionType == "Race") ||
            (sessionStatus == "Finished" && sessionType == "Practice")) &&
        !timingData[racingNumber].PitOut
    ) {
        if (sessionType == "Race") {
            console.log(
                racingNumber + " is lining up during the formation lap"
            );
            return false;
        }
        console.log(racingNumber + " is doing a practice grid start");
        return true;
    }
    // Detect race start
    // If the race is started and the last mini sector has a different value then 0 (has a value)
    if (
        sessionType == "Race" &&
        sessionStatus == "Started" &&
        timingData[racingNumber].Sectors[
            +timingData[racingNumber].Sectors.length - 1
        ].Segments[
            +timingData[racingNumber].Sectors[
                +timingData[racingNumber].Sectors.length - 1
            ].Segments.length - 3
        ].Status != 0 &&
        lapCount.CurrentLap == 1
    ) {
        console.log(racingNumber + " is doing a race start");
        return false;
    }
    // Detect if practice start
    // If the session is 'practice' and the second mini sector does have a value.
    if (sessionType == "Practice" && timingData[racingNumber].PitOut) {
        console.log(racingNumber + " is doing a practice pitlane start");
        return true;
    }
    if (
        sessionType == "Race" &&
        sessionStatus == "Finished" &&
        timingData[racingNumber].Sectors[
            +timingData[racingNumber].Sectors.length - 2
        ].Segments[
            +timingData[racingNumber].Sectors[
                +timingData[racingNumber].Sectors.length - 2
            ].Segments.length - 1
        ].Status != 0
    ) {
        console.log(racingNumber + " is in parc ferme");
        return false;
    }
    console.log(racingNumber + " has crashed");
    return true;
}

function getCarData(number) {
    try {
        carData[0].Cars[number].Channels;
        if (debug) {
            console.log("------------------------------");
            console.log(carData[0].Cars[number].Channels);
        }
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[number].Channels;
}

function neutralFilter(number) {
    if (
        sessionStatus == "Inactive" ||
        sessionStatus == "Aborted" ||
        (sessionInfo.Type != "Race" && timingData[number].PitOut)
    ) {
        return "";
    }
    return 0;
}

function getCarStatus(data, racingNumber) {
    let rpm = data[0];
    let speed = data[2];
    let gear = data[3];
    let speedLimit = getSpeedLimit();
    if (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear === neutralFilter(racingNumber)
    ) {
        return true;
    } else {
        return false;
    }
}

function getCurrentExceptions(racingNumber) {
    let data = getCarData(racingNumber);
    if (data !== "error") {
        let crashed = getCarStatus(data, racingNumber);
        if (sessionType == "Race") {
            if (lapCount.CurrentLap == mvpLog.lap) {
                if (mvpLog.drivers.includes(racingNumber)) {
                    return true;
                }
            } else {
                mvpLog.lap = lapCount.CurrentLap;
                mvpLog.drivers = [];
            }
        }
        let driverData = timingData[racingNumber];
        if (crashed) {
            if (
                (driverData.InPit && sessionType != "Race") ||
                driverData.Retired ||
                driverData.Stopped
            ) {
                crashed = false;
            }
        } else {
            if (driverData.InPit && sessionType == "Race") {
                crashed = true;
            }
        }
        if (crashed) {
            // PPS = Practice Pitlane Start
            // PGS = Pracice Grid Start
            // RS = Race Start
            // GL = Grid Lineup
            const influence = whatHappended(racingNumber);
            return influence;
        }
    }
}

// Runing all function to add the funtionality
async function run() {
    while (true) {
        await getConfigurations();
        await apiRequests();
        const prioList = await setPriorities();
        const players = await getAllPlayers();
        const windowAmount = players[0];
        const shownDrivers = players[1];
        // console.log(shownDrivers);
        loop1: for (i in prioList) {
            let driver = prioList[i];
            if (i < windowAmount) {
                if (!shownDrivers[driver]) {
                    loop2: for (shown in shownDrivers) {
                        if (!prioList.slice(0, windowAmount).includes(shown)) {
                            console.log("Replace " + shown + " with " + driver);
                            await replaceWindow(shownDrivers, shown, driver);
                            await sleep(1000);
                            break loop1;
                        }
                    }
                }
            } else {
                break;
            }
        }
        // const detection = await getCurrentExceptions();
        // if (detection != undefined) {
        //     await replaceWindow(shownDrivers);
        // }
        // const pitSwitch = await pitLaneSwitch(shownDrivers);
        await sleep(500);
    }
}

run();
