const debug = true;

const host = "localhost";
const port = 10101;

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
function apiRequests() {}
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
    if (debug) console.log(api);
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
        console.log(carData);
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
        return 0;
    }
    return 30;
}

function otherInfluence(racingNumber) {
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
        return true;
    }
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
        return true;
    }
    // Detect if practice pitstop
    // If the session is 'practice' and the second mini sector does have a value.
    if (
        sessionType == "Practice" &&
        timingData[racingNumber].PitOut &&
        timingData[racingNumber].Sectors[0].Segments[1].Status == 0
    ) {
        return true;
    }
    return false;
}

function neutralFilter() {
    if (
        sessionType == "Race" &&
        (sessionStatus == "Inactive" || sessionStatus == "Aborted")
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
        gear === neutralFilter()
    ) {
        return true;
    } else {
        return false;
    }
}

for (i in driverList) {
    if (!isNaN(+i)) {
        let number = driverList[i].RacingNumber;
        let name = getDriverName(number);
        let color = getTeamColor(number);
        let data = getCarData(number);
        if (data !== "error") {
            console.log(i);
            let crashed = getCarStatus(data, number);
            if (crashed) {
                let driverData = timingData[number];
                if (
                    driverData.InPit === true ||
                    driverData.Retired === true ||
                    driverData.Stopped === true ||
                    otherInfluence(number)
                ) {
                    crashed = false;
                }
            }
            if (crashed) {
                if (debug) {
                    console.log(name + " has crashed");
                }
            }
        }
    } else {
        if (debug) {
            console.log("NaN");
        }
    }
}

// Runing all function to add the funtionality
async function run() {
    getAllOBCs();
}

run();
