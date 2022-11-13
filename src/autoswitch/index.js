const debug = false;

const host = "localhost";
const port = 10101;

const priorityList = [1, 16, 11, 44, 55, 63];

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

// Get all the onboard camera's
function getAllOBCs() {
    // Temp testing code
    const obc1 = document.getElementById("obc1");
    const obc2 = document.getElementById("obc2");
    const obc3 = document.getElementById("obc3");
    const obc4 = document.getElementById("obc4");
    const obc5 = document.getElementById("obc5");
    const obc6 = document.getElementById("obc6");
}

// Receive all the API endpoints
let sessionType = JSON.parse(
    httpGet(`http://${host}:${port}/api/v2/live-timing/state/SessionInfo`)
).Type;
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
function apiRequests() {
    if (sessionType == "Race") {
        const api = JSON.parse(
            httpGet(
                `http://${host}:${port}/api/v2/live-timing/state/CarData,LapCount,DriverList,SessionData,SessionInfo,SessionStatus,TimingData,TimingStats,TrackStatus`
            )
        );
        if (debug) console.log(api);
        carData = api.CarData.Entries;
        lapCount = api.LapCount;
        driverList = api.DriverList;
        sessionData = api.SessionData;
        sessionInfo = api.SessionInfo;
        sessionType = sessionType;
        sessionStatus = api.SessionStatus.Status;
        timingData = api.TimingData.Lines;
        timingStats = api.TimingStats.Lines;
        trackStatus = api.TrackStatus;
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
    } else {
        const api = JSON.parse(
            httpGet(
                `http://${host}:${port}/api/v2/live-timing/state/CarData,DriverList,SessionData,SessionInfo,SessionStatus,TimingData,TimingStats,TrackStatus`
            )
        );
        // if (debug) console.log(api);
        carData = api.CarData.Entries;
        driverList = api.DriverList;
        sessionData = api.SessionData;
        sessionInfo = api.SessionInfo;
        sessionType = sessionType;
        sessionStatus = api.SessionStatus.Status;
        timingData = api.TimingData.Lines;
        timingStats = api.TimingStats.Lines;
        trackStatus = api.TrackStatus;
        if (debug) {
            // console.log(carData);
            // console.log(driverList);
            // console.log(sessionData);
            // console.log(sessionInfo);
            // console.log(sessionType);
            // console.log(sessionStatus);
            // console.log(timingData);
            // console.log(timingStats);
            // console.log(trackStatus);
        }
    }
}
apiRequests();

let driverInfo = {};
let influenceCounter = 0;
function emptyDriverInfo() {
    for (i in driverList) {
        driverInfo[i] = {};
        driverInfo[i]["important"] = false;
        driverInfo[i]["shown"] = false;
        driverInfo[i]["browserWindowId"] = "none";
    }
}
emptyDriverInfo();

function getDriverName(number) {
    if (debug) {
    }
    return (
        driverList[number].FirstName +
        " " +
        driverList[number].LastName.toUpperCase()
    );
}

function getTeamColor(number) {
    return driverList[number].TeamColour;
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
        sessionStatus == "Aborted"
    ) {
        return 10;
    }
    return 30;
}

function otherInfluence(racingNumber) {
    if (driverInfo[racingNumber].important) {
        return true;
    }
    influenceCounter++;
    driverInfo[racingNumber].important = true;
    if (debug) console.log("Influences: " + influenceCounter);
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
        (sessionStatus == "Inactive" || sessionStatus == "Finished")
    ) {
        if (sessionType == "Race") {
            return "GL";
        }
        return "PGS";
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
            ].Segments.length - 1
        ].Status != 0
    ) {
        return "RS";
    }
    // Detect if practice start
    // If the session is 'practice' and the second mini sector does have a value.
    if (
        (sessionType == "Practice" &&
            timingData[racingNumber].PitOut &&
            timingData[racingNumber].Sectors[0].Segments[1].Status == 0) ||
        timingData[racingNumber].Sectors[
            +timingData[racingNumber].Sectors.length - 1
        ].Segments[
            +timingData[racingNumber].Sectors[
                +timingData[racingNumber].Sectors.length - 1
            ].Segments.length - 1
        ].Status == 2064
    ) {
        return "PPS";
    }
    return false;
}

function neutralFilter(number) {
    if (
        sessionStatus == "Inactive" ||
        sessionStatus == "Aborted" ||
        (sessionType != "Race" && timingData[number].PitOut)
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

function getCurrentExceptions() {
    for (i in driverList) {
        if (!isNaN(+i)) {
            let number = driverList[i].RacingNumber;
            let name = getDriverName(number);
            let color = getTeamColor(number);
            let data = getCarData(number);
            if (data !== "error") {
                // console.log(i);
                let crashed = getCarStatus(data, number);
                if (crashed) {
                    let driverData = timingData[number];
                    if (
                        driverData.InPit ||
                        driverData.Retired ||
                        driverData.Stopped
                    ) {
                        crashed = false;
                    }
                }
                console.log(crashed);
                if (crashed) {
                    // PPS = Practice Pitlane Start
                    // PGS = Pracice Grid Start
                    // RS = Race Start
                    // GL = Grid Lineup
                    const influence = otherInfluence(number);
                    if (influence == "PPS") {
                        if (debug)
                            console.log(
                                name + " is doing a pitlane practice start"
                            );
                    } else if (influence == "PGS") {
                        if (debug)
                            console.log(
                                name + " is doing a grid practice start"
                            );
                    } else if (influence == "RS") {
                        if (debug) console.log(name + " is doing a race start");
                    } else if (influence == "GL") {
                        if (debug) console.log(name + " is lining up the grid");
                    } else if (influence) {
                        return;
                    } else {
                        if (debug) {
                            console.log(name + " has crashed");
                        }
                    }
                    return number;
                } else {
                    if (driverInfo[number].important) {
                        influenceCounter--;
                        if (debug) {
                            console.log(name + " is continuing");
                            console.log("Influences: " + influenceCounter);
                        }
                    }

                    driverInfo[number].important = false;
                }
            }
        } else {
            if (debug) {
                console.log("NaN");
            }
        }
    }
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

let playerAssignment = {};
let channelId;
let shownDrivers = [];
async function getAllPlayers() {
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
        driverInfo[data[i].driverData.driverNumber].shown = true;
        driverInfo[data[i].driverData.driverNumber].browserWindowId =
            data[i].id;
    }
    channelId = data[0].streamData.contentId;
    if (debug) {
        console.log(driverInfo);
        console.log(shownDrivers);
        console.log(playerAssignment);
        console.log(channelId);
    }
    return data;
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

async function syncWithOther(driver) {
    let syncPlayer;
    for (i in driverInfo) {
        if (debug) console.log(i != driver);
        if (i != driver) {
            if (driverInfo[i].browserWindowId != "none") {
                syncPlayer = driverInfo[i].browserWindowId;
            }
        }
    }
    if (debug) console.log(syncPlayer);
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

async function createWindow(oldDriver, newDriver) {
    const browserWindowId = driverInfo[oldDriver].browserWindowId;
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

async function showNewWindow(oldDriver, newId) {
    const browserWindowId = newId;
    const oldBrowserWindowId = driverInfo[oldDriver].browserWindowId;
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

async function removeWindow(oldDriver) {
    const browserWindowId = driverInfo[oldDriver].browserWindowId;
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

async function replaceWindow(oldDriver, newDriver) {
    console.log("Replacing " + oldDriver + " with " + newDriver);

    const newWindow = await createWindow(oldDriver, newDriver);

    await sleep(1000);

    await setSpeedometerVisibility(newWindow.data.playerCreate);

    await syncWithOther(newDriver);

    await sleep(2000);

    await showNewWindow(oldDriver, newWindow.data.playerCreate);

    const oldWindow = await removeWindow(oldDriver);

    driverInfo[oldDriver].shown = false;
    driverInfo[oldDriver].browserWindowId = "none";
    driverInfo[newDriver].shown = true;
    driverInfo[newDriver].browserWindowId = newWindow.data.playerCreate;

    console.log("Replaced " + oldDriver + " with " + newDriver);

    if (debug) {
        console.log(newWindow);
        console.log(driverInfo);
    }
}

async function pitLaneSwitch(players) {
    // New code
    for (timing in timingData) {
        if (
            timingData[timing].InPit &&
            driverInfo[timing].shown &&
            carData[0].Cars[timing].Channels[2] <= 5 &&
            sessionType != "Race"
        ) {
            for (driver in driverInfo) {
                if (driverInfo[driver].important && !driverInfo[driver].shown) {
                    console.log(timing + " is a important driver.");
                    await replaceWindow(timing, priorityList[priority]);
                }
            }
            for (priority in priorityList) {
                if (
                    !driverInfo[priorityList[priority]].shown &&
                    !timingData[priorityList[priority]].InPit
                ) {
                    if (debug) {
                        console.log(timing);
                        console.log(priorityList[priority]);
                    }
                    console.log(
                        timing + " when and stopped into the pit lane."
                    );
                    await replaceWindow(timing, priorityList[priority]);
                    return;
                }
            }
        }
    }

    // Old code
    // const playerAmount = players.length;
    // if (debug) console.log(playerAmount);

    // for (timing in timingData) {
    //     for (priority in priorityList) {
    //         for (driver in driverList[timing]) {
    //             if (driverList[timing].important) {
    //                 if (!driverList[timing].shown) {
    //                     if (timing == priority && !driverList[timing].shown) {
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     console.log(i + "");
    //     console.log(timingData[i].InPit && carData[0].Cars[i].Channels[2] <= 5);
    //     if (timingData[i].InPit && carData[0].Cars[i].Channels[2] <= 5) {
    //         if (driverInfo[i].shown) {
    //             for (index in priorityList) {
    //                 if (
    //                     !driverInfo[priorityList[index]].shown &&
    //                     !timingData[priorityList[index]].InPit
    //                 ) {
    //                     const oldDriver = i;
    //                     const newDriver = priorityList[index];
    //                     if (debug) {
    //                         console.log(oldDriver);
    //                         console.log(newDriver);
    //                     }
    //                     await replaceWindow(oldDriver, newDriver);
    //                     return "Replaced " + oldDriver + " with " + newDriver;
    //                 }
    //             }
    //         }
    //     }
    // }
}

// Runing all function to add the funtionality
async function run() {
    await getAllPlayers();
    // await replaceWindow(1, 77);
    while (true) {
        await apiRequests();
        const players = await getAllPlayers();
        const detection = await getCurrentExceptions();
        if (detection != undefined) {
            await replaceWindow();
        }
        const pitSwitch = await pitLaneSwitch(players);
        await sleep(250);
    }
}

run();
