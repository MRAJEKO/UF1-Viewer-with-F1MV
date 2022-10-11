const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

let api;
let sessionStatus;
let raceTimer;
let sessionTimer;
let headPadding;
let drs;
let manTyres;
let pitEntry;
let pitExit;
let currentProgress;
let maxProgress;
let statusContainer;

let sessionInfo;
let RCMs;
let laps;

function apiRequest() {
    sessionInfo = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
    );
    RCMs = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/RaceControlMessages")
    );
    laps = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/LapCount")
    );
}

function addTrackSectors() {
    let circuitKey = sessionInfo.Meeting.Circuit.Key;

    let season = sessionInfo.StartDate.slice(0, 4);

    let circuit = JSON.parse(
        httpGet(`https://api.f1mv.com/api/v1/circuits/${circuitKey}/${season}`)
    );

    let trackSectors = circuit.marshalSectors;
    for (i in trackSectors) {
        let text = `<h1>Sector ${+i + 1}</h1>
            <p class="green" id="trackSector${+i + 1}">Status</p>`;
        statusContainer.innerHTML += text;
    }
}

function addDrsZones() {}

function getMainHTML() {
    statusContainer = document.getElementById("statuses");
    sessionStatus = document.querySelector("#session p");
    raceTimer = document.querySelector("#timer1");
    sessionTimer = document.querySelector("#timer2");
    headPadding = document.querySelector("#head-material p");
    drs = document.querySelector("#drs p");
    manTyres = document.querySelector("#tyres p");
    pitEntry = document.querySelector("#pit-entry p");
    pitExit = document.querySelector("#pit-exit p");
    currentProgress = document.querySelector("#percentage p");
}

function setSession() {}

function setTimers() {}

function setHeadPadding() {}

function setDRS() {}

function setManTyres() {}

function setPitEntry() {}

function setPitExit() {}

function setProgress() {}

function setTrackStatus() {}

apiRequest();
getMainHTML();
addTrackSectors();

let count = 0;
async function run() {
    while (true) {
        console.log(count++);
        await sleep(200);
    }
}

run();
