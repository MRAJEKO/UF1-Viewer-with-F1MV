const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let lapCount;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.improvements;
    lapCount = config.lap_amount;
}

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
    let endpoints = "DriverList,TimingAppData,TimingData,TimingStats,SessionInfo,TopThree";
    let api = JSON.parse(httpGet("http://localhost:10101/api/v2/live-timing/state/" + endpoints));
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

async function showImprovedLap(data) {
    console.log(data);
    let container = document.getElementById("container");
    console.log(container.children.length);
    let length = container.children.length;
    let newLap = `<div class="header">
            <div class="position">
                <p>${data.position}</p>
            </div>
            <div class="icon" style="background-color: ${data.teamColor}">
                <img src="${data.teamIcon}" alt="" />
            </div>
            <div class="name">
                <p>${data.name}</p>
            </div>
            <div class="tire">
                <p style="color: ${data.tireColor}">${data.tire}</p>
            </div>
        </div>
        <div class="times">
            <div class="personal">
                <p style="color: ${data.lapTimeColor}">${data.lapTime}</p>
            </div>
            <div class="target">
                <div class="top">
                    <div class="delta">
                        <p style="color: ${data.targetDeltaColor}">${data.targetDelta}</p>
                    </div>
                    <div class="target-time">
                        <p style="color: ${data.targetTimeColor}">${data.targetTime}</p>
                    </div>
                </div>
                <div class="bottom">
                    <div class="target-position">
                        <p>${data.targetPosition}</p>
                    </div>
                    <div class="target-name"><p>${data.targetName}</p></div>
                </div>
            </div>
        </div>
        <div class="sectors">
            <div id="sector1" class="sector">
                <div class="sector-times">
                    <div class="sector-time">
                        <p>${data.sector1.time}</p>
                    </div>
                    <div class="sector-delta">
                        <p style="color: ${data.sector1.deltaColor}">${data.sector1.delta}</p>
                    </div>
                </div>
                <div
                    class="sector-color"
                    style="background-color: ${data.sector1.color}"
                ></div>
            </div>
            <div id="sector2" class="sector">
                <div class="sector-times">
                    <div class="sector-time">
                        <p>${data.sector2.time}</p>
                    </div>
                    <div class="sector-delta">
                        <p style="color: ${data.sector2.deltaColor}">${data.sector2.delta}</p>
                    </div>
                </div>
                <div
                    class="sector-color"
                    style="background-color: ${data.sector2.color}"
                ></div>
            </div>
            <div id="sector3" class="sector">
                <div class="sector-times">
                    <div class="sector-time">
                        <p>${data.sector3.time}</p>
                    </div>
                    <div class="sector-delta">
                        <p style="color: ${data.sector3.deltaColor}">${data.sector3.delta}</p>
                    </div>
                </div>
                <div
                    class="sector-color"
                    style="background-color: ${data.sector3.color}"
                ></div>
            </div>
        </div>`;
    let newElement = document.createElement("li");
    newElement.classList.add("improved-time");
    newElement.innerHTML = newLap;
    container.appendChild(newElement);
    container = document.getElementById("container");
    await sleep(10);
    newElement.classList.add("show");
    if (length >= lapCount) {
        let lastLap = container.children[0];
        console.log(container.children);
        console.log(container.children[0]);
        console.log(lastLap);
        lastLap.classList.remove("show");
        await sleep(400);
        lastLap.remove();
        console.log(container);
    }
}

async function getImprovedDriver() {
    for (i in timingData) {
        if (timingData[i].LastLapTime.PersonalFastest && timingData[i].BestLapTime.Value != bestLapTimes[i]) {
            bestLapTimes[i] = timingData[i].BestLapTime.Value;
            let driverData = await getAllDriverData(i);
            await showImprovedLap(driverData);
        }
    }
}

function getSectorInfo(driverNumber, sectorNumber, targetRacingNumber) {
    let sectorInfo = [];
    let driverTime = +timingData[driverNumber].Sectors[sectorNumber - 1].Value;
    let targetTime = +bestTimes[targetRacingNumber].BestSectors[sectorNumber - 1].Value;
    if (debug) {
        console.log(driverTime);
        console.log(targetTime);
    }
    let delta = +(driverTime - targetTime).toFixed(3);
    let deltaColor = "yellow";
    if (delta >= 0) {
        delta = "+" + delta;
    } else {
        deltaColor = "#00ff00";
    }
    let sectorColor = "#00ff00";
    if (timingData[driverNumber].Sectors[sectorNumber - 1].OverallFastest) {
        sectorColor = "#800080";
    } else if (timingData[driverNumber].Sectors[sectorNumber - 1].PersonalFastest) {
        sectorColor = "#00ff00";
    } else {
        sectorColor = "yellow";
    }
    sectorInfo["sectorTime"] = driverTime;
    sectorInfo["sectorDelta"] = delta;
    sectorInfo["deltaColor"] = deltaColor;
    sectorInfo["sectorColor"] = sectorColor;
    return sectorInfo;
}

async function getAllDriverData(racingNumber) {
    let driverData = [];
    let lapTime = timingData[racingNumber].LastLapTime.Value;
    driverData["lapTime"] = lapTime;
    let position = timingData[racingNumber].Position;
    driverData["position"] = position;
    driverData["teamIcon"] = await ipcRenderer.invoke("get_icon", driverList[racingNumber].TeamName);
    driverData["teamColor"] = "#" + driverList[racingNumber].TeamColour;
    driverData["name"] = driverList[racingNumber].LastName.toUpperCase();
    console.log(racingNumber);
    let tire = tireData[racingNumber].Stints[+tireData[racingNumber].Stints.length - 1].Compound.charAt(0);
    driverData["tire"] = tire;
    let tireColor = "red";
    if (tire == "H") {
        tireColor = "white";
    }
    if (tire == "M") {
        tireColor = "yellow";
    }
    if (tire == "I") {
        tireColor = "green";
    }
    if (tire == "W") {
        tireColor = "green";
    }
    if (tire == "U" || tire == "T") {
        tireColor = "gray";
    }
    driverData["tireColor"] = tireColor;
    let targetPosition;
    let lapTimeColor;
    let targetTimeColor;
    if (position != 1) {
        targetPosition = "P" + 1;
        lapTimeColor = "#00ff00";
        targetTimeColor = "#800080";
    } else {
        targetPosition = "P" + 2;
        lapTimeColor = "#800080";
        targetTimeColor = "#00ff00";
    }
    driverData["targetTimeColor"] = targetTimeColor;
    driverData["lapTimeColor"] = lapTimeColor;
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
        targetDeltaColor = "#00ff00";
    }
    driverData["targetDelta"] = targetDelta;
    driverData["targetDeltaColor"] = targetDeltaColor;
    driverData["targetName"] = driverList[targetRacingNumber].LastName.toUpperCase();
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
    await getConfigurations();
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
        await sleep(250);
        apiRequests();
        getImprovedDriver();
    }
}

run();
