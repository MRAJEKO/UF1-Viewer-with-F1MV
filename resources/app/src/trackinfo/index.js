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
let lapCount;
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
let delayed;
let headPaddingMaterial;
let backgroundColor;

let sessionInfo;
let RCMs;
let laps;
let sessionStartStatus;

function apiRequests() {
    RCMs = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/RaceControlMessages")
    );
    laps = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/LapCount")
    );
    sessionStartStatus = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/SessionStatus")
    );
    if (sessionInfo == undefined) {
        sessionInfo = JSON.parse(
            httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
        );
    }
}

function addTrackSectors() {
    console.log(sessionInfo);
    let circuitKey = sessionInfo.Meeting.Circuit.Key;

    let season = sessionInfo.StartDate.slice(0, 4);

    let circuit = JSON.parse(
        httpGet(`https://api.f1mv.com/api/v1/circuits/${circuitKey}/${season}`)
    );

    console.log(circuit);

    let trackSectors = circuit.marshalSectors;
    for (i in trackSectors) {
        let text = `<h1>Sector ${+i + 1}</h1>
            <p class="green" id="trackSector${+i + 1}">Status</p>`;
        statusContainer.innerHTML += text;
    }
}

function getMainHTML() {
    statusContainer = document.getElementById("statuses");
    sessionStatus = document.querySelector("#session-status");
    lapCount = document.querySelector("#lap-count");
    raceTimer = document.querySelector("#timer1");
    sessionTimer = document.querySelector("#timer2");
    headPadding = document.querySelector("#head-material p");
    drs = document.querySelector("#drs p");
    manTyres = document.querySelector("#tyres p");
    pitEntry = document.querySelector("#pit-entry p");
    pitExit = document.querySelector("#pit-exit p");
    currentProgress = document.querySelector("#percentage p");
}

function setSession() {
    let status = sessionStartStatus.Status;
    if (status == "Aborted") {
        status = "SUSPENDED";
        backgroundColor = "red";
    } else if (status == "Started") {
        status = "ONGOING";
        backgroundColor = "green";
    } else if (status == "Finished" || "Finalised") {
        status = "FINISHED";
        backgroundColor = "white";
    } else if (status == "Inactive" && delayed != true) {
        for (i in RCMs.Messages) {
            if (RCMs.Messages[i].Message.includes("SUSPENDED" || "DELAYED")) {
                status = "DELAYED";
                backgroundColor = "orange";
            } else {
                status = "ONSCHEDULE";
                backgroundColor = "green";
            }
        }
    }
    let sessionType = sessionInfo.Type;
    if (sessionType == "Race") {
        let lapCounter = "Lap: " + laps.CurrentLap + "/" + laps.TotalLaps;
        console.log(status + "\n" + lapCounter);
        sessionStatus.innerHTML = status;
        sessionStatus.className = backgroundColor;
        lapCount.className = "";
        lapCount.innerHTML = lapCounter;
    } else {
        sessionStatus.innerHTML = status;
        sessionStatus.className = backgroundColor;
    }
}

function setHeadPadding(message) {
    if (message.Category == "Other") {
        let color;
        if (message.Message.includes("BLUE")) {
            color = "BLUE";
            backgroundColor = "blue";
        } else if (message.Message.includes("LIGHT BLUE")) {
            color = "LIGHT BLUE";
            backgroundColor = "light-blue";
        } else if (message.Message.includes("PINK")) {
            color = "PINK";
            backgroundColor = "pink";
        } else {
            color = "UNKNOWN";
            backgroundColor = "white";
        }
        headPadding.innerHTML = color + " MATERIAL";
        headPadding.className = backgroundColor;
    }
    headPaddingMaterial = true;
}

function setManTyres(message) {
    let tyres;
    if (message.Message.includes("USE OF WET WEATHER")) {
        tyres = "INTERMEDIATES";
        backgroundColor = "green";
    } else if (message.Message.includes("EXTREME TIRES" || "EXTREME TYRES")) {
        tyres = "FULL WETS";
        backgroundColor = "blue";
    } else {
        tyres = "NONE";
        backgroundColor = "white";
    }
    manTyres.innerHTML = tyres;
    manTyres.className = backgroundColor;
}

function forRaceControlMessages() {
    for (i in RCMs.Messages) {
        let message = RCMs.Messages[i];
        if (headPaddingMaterial != true) {
            setHeadPadding(message);
        }
        setManTyres(message);
    }
}

function setDRS() {
    for (i in RCMs.Messages) {
        if (RCMs.Messages[i].Category == "Drs") {
        }
    }
}

function setTimers() {}

function addDrsZones() {}

function setPitEntry() {}

function setPitExit() {}

function setProgress() {}

function setTrackStatus() {}

let count = 0;
async function run() {
    apiRequests();
    getMainHTML();
    addTrackSectors();
    while (true) {
        setSession();
        forRaceControlMessages();
        console.log(count++);
        await sleep(200);
    }
}

run();
