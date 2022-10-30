const debug = false;

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

function apiRequests() {
    let endpoints =
        "DriverList,TimingAppData,TimingData,TimingStats,SessionInfo,TopThree";
    let api = JSON.parse(
        httpGet("http://localhost:10101/api/v2/live-timing/state/" + endpoints)
    );
    driverList = api.DriverList;
    tireData = api.TimingAppData.Lines;
    timingData = api.TimingData.Lines;
    bestTimes = api.TimingStats.Lines;
    sessionInfo = api.SessionInfo;
    topThree = api.TopThree.Lines;
}

let bestLapTimes = [];

function setDriverTimes() {
    for (i in timingData) {
        bestLapTimes[i] = timingData[i].BestLapTime.Value;
    }
}

async function getImprovedDriver() {
    for (i in timingData) {
        if (
            timingData[i].LastLapTime.PersonalFastest ||
            timingData[i].BestLapTime.Value != bestLapTimes[i]
        ) {
            bestLapTimes[i] = timingData[i].BestLapTime.Value;
            let driverData = await getAllDriverData(i);
            console.log(driverData);
        }
    }

    console.log(bestLapTimes);
}

function getSectorInfo(driverNumber, sectorNumber, targetRacingNumber) {
    let sectorInfo = [];
    let driverTime = +timingData[driverNumber].Sectors[sectorNumber - 1].Value;
    let targetTime =
        +bestTimes[targetRacingNumber].BestSectors[sectorNumber - 1].Value;
    if (debug) {
        console.log(driverTime);
        console.log(targetTime);
    }
    let delta = +(driverTime - targetTime).toFixed(3);
    let deltaColor = "yellow";
    if (delta >= 0) {
        delta = "+" + delta;
    } else {
        deltaColor = "green";
    }
    let sectorColor = "green";
    if (timingData[driverNumber].Sectors[sectorNumber - 1].OverallFastest) {
        sectorColor = "purple";
    } else if (
        timingData[driverNumber].Sectors[sectorNumber - 1].PersonalFastest
    ) {
        sectorColor = "green";
    } else {
        sectorColor = "yellow";
    }
    sectorInfo["sectorTime"] = driverTime;
    sectorInfo["sectorDelta"] = delta;
    sectorInfo["deltaColor"] = deltaColor;
    sectorInfo["sectorColor"] = sectorColor;
    return sectorInfo;
}

const icons = {
    "Red Bull Racing": "red-bull.png",
    McLaren: "mclaren-white.png",
    "Aston Martin": "aston-martin.png",
    Williams: "williams-white.png",
    AlphaTauri: "alpha-tauri.png",
    Alpine: "alpine.png",
    Ferrari: "ferrari.png",
    "Haas F1 Team": "haas-red.png",
    "Alfa Romeo": "alfa-romeo.png",
    Mercedes: "mercedes.png",
};
async function getAllDriverData(racingNumber) {
    let driverData = [];
    let lapTime = timingData[racingNumber].LastLapTime.Value;
    driverData["lapTime"] = lapTime;
    let position = timingData[racingNumber].Position;
    driverData["position"] = position;
    driverData["teamIcon"] = "../icons/" + icons[driverList[i].TeamName];
    driverData["teamColor"] = driverList[i].TeamColour;
    driverData["name"] = driverList[i].LastName.toUpperCase();
    let tire =
        tireData[i].Stints[+tireData[i].Stints.length - 1].Compound.charAt(0);
    driverData["tire"] = tire;
    let tireColor = "soft";
    if (tire == "H") {
        tireColor = "hard";
    }
    if (tire == "M") {
        tireColor = "medium";
    }
    driverData["tireColor"] = tireColor;
    let targetPosition;
    if (position != 1) {
        targetPosition = "P" + 1;
    } else {
        targetPosition = "P" + 2;
    }
    driverData["targetPosition"] = targetPosition;
    let targetRacingNumber;
    for (i in topThree) {
        if (topThree[i].Position == +targetPosition.charAt(1)) {
            targetRacingNumber = topThree[i].RacingNumber;
        }
    }
    let targetTime = timingData[targetRacingNumber].BestLapTime.Value;
    driverData["targetTime"] = targetTime;
    let targetDelta = (
        +(+lapTime.split(":")[0] * 60 + +lapTime.split(":")[1]) -
        +(+targetTime.split(":")[0] * 60 + +targetTime.split(":")[1])
    ).toFixed(3);
    let targetDeltaColor = "yellow";
    if (targetDelta >= 0) {
        targetDelta = "+" + targetDelta;
    } else {
        targetDeltaColor = "green";
    }
    driverData["targetDelta"] = targetDelta;
    driverData["targetDeltaColor"] = targetDeltaColor;
    driverData["targetName"] =
        driverList[targetRacingNumber].FirstName +
        " " +
        driverList[targetRacingNumber].LastName.toUpperCase();
    let sector1 = getSectorInfo(racingNumber, 1, targetRacingNumber);
    let sector1time = sector1.sectorTime;
    let sector1delta = sector1.sectorDelta;
    let sector1deltaColor = sector1.deltaColor;
    let sector1color = sector1.sectorColor;
    driverData["sector1"] = [];
    driverData["sector1"]["time"] = sector1time;
    driverData["sector1"]["delta"] = sector1delta;
    driverData["sector1"]["deltaColor"] = sector1deltaColor;
    driverData["sector1"]["color"] = sector1color;
    let sector2 = getSectorInfo(racingNumber, 2, targetRacingNumber);
    let sector2time = sector2.sectorTime;
    let sector2delta = sector2.sectorDelta;
    let sector2deltaColor = sector2.deltaColor;
    let sector2color = sector2.sectorColor;
    driverData["sector2"] = [];
    driverData["sector2"]["time"] = sector2time;
    driverData["sector2"]["delta"] = sector2delta;
    driverData["sector2"]["deltaColor"] = sector2deltaColor;
    driverData["sector2"]["color"] = sector2color;
    let sector3 = getSectorInfo(racingNumber, 3, targetRacingNumber);
    let sector3time = sector3.sectorTime;
    let sector3delta = sector3.sectorDelta;
    let sector3deltaColor = sector3.deltaColor;
    let sector3color = sector3.sectorColor;
    driverData["sector3"] = [];
    driverData["sector3"]["time"] = sector3time;
    driverData["sector3"]["delta"] = sector3delta;
    driverData["sector3"]["deltaColor"] = sector3deltaColor;
    driverData["sector3"]["color"] = sector3color;
    if (debug) {
        console.log(driverData);
        console.log(sector1);
        console.log(sector1time);
    }
    return driverData;
}

async function run() {
    apiRequests();
    setDriverTimes();
    while (true) {
        apiRequests();
        getImprovedDriver();
        if (debug) {
            console.log(driverList);
            console.log(tireData);
            console.log(timingData);
            console.log(bestTimes);
            console.log(sessionInfo);
        }
        await sleep(10000);
        apiRequests();
        getImprovedDriver();
    }
}

run();
