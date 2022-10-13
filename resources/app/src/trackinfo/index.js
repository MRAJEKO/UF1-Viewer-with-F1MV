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
let pastMessages = [];
let drsEnabled = true;
let drsZoneNumber;

let sessionInfo;
let RCMs;
let laps;
let sessionStartStatus;

function apiRequests() {
    if (sessionInfo == undefined) {
        sessionInfo = JSON.parse(
            httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
        );
    }
    RCMs = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/RaceControlMessages")
    );
    if (sessionInfo.Type == "Race") {
        laps = JSON.parse(
            httpGet("http://localhost:10101/api/v1/live-timing/LapCount")
        );
    }
    sessionStartStatus = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/SessionStatus")
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
            <p class="green" id="trackSector${+i + 1}">CLEAR</p>`;
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
    fullTrackStatus = document.querySelector("#sector-info #head p");
}

function setSession() {
    let status = sessionStartStatus.Status;
    if (status == "Aborted") {
        status = "SUSPENDED";
        backgroundColor = "red";
    } else if (status == "Started") {
        status = "ONGOING";
        backgroundColor = "green";
    } else if (status == "Finished" || status == "Finalised") {
        status = "FINISHED";
        backgroundColor = "white";
    }
    if (status == "Inactive" && delayed != true) {
        for (i in RCMs.Messages) {
            if (RCMs.Messages[i].Message.includes("SUSPENDED" || "DELAYED")) {
                status = "DELAYED";
                backgroundColor = "orange";
                delayed = true;
            } else {
                status = "ONSCHEDULE";
                backgroundColor = "green";
            }
        }
    }
    let sessionType = sessionInfo.Type;
    if (sessionType == "Race") {
        let lapCounter = "Lap: " + laps.CurrentLap + "/" + laps.TotalLaps;
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
        headPaddingMaterial = true;
    }
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

        if (pastMessages.includes(JSON.stringify(message))) {
        } else {
            pastMessages += JSON.stringify(message);
            setHeadPadding(message);
            setManTyres(message);
            getDRS(message);
            setTrackSectors(message);
        }
    }
}

function getDRS(message) {
    if (message.Category == "Drs") {
        if (pastMessages.includes(JSON.stringify(message))) {
        } else {
            pastMessage += JSON.stringify(message);
            if (message.Message.includes("ENABLED")) {
                drsEnabled = true;
            } else drsEnabled = false;
        }
    }
}

// function getDRS(message) {
//     if (message.Category == "Drs") {
//         if (message.Message.includes("ZONE")) {
//             drsZoneNumber = +message.Message.match(/(\d+)/)[0];
//             console.log(drsZoneNumber);
//         }
//     }
// }

function setDRS() {
    if (drsEnabled) {
        drs.innerHTML = "ENABLED";
        drs.className = "green";
    } else {
        drs.innerHTML = "DISABLED";
        drs.className = "red";
    }
}

function setTimers() {}

function addDrsZones() {}

function setPitEntry() {}

function setPitExit() {}

function setProgress() {}

function setTrackStatus() {}

function setTrackSectors(message) {
    console.log(message);
    if (message.OriginalCategory == "Flag") {
        if (/\d/.test(message.Message)) {
            let sectorNumber = +message.Message.match(/\d+/)[0];
            console.log(sectorNumber);
            let flag = "CLEAR";
            let trackStatus = document.querySelector(
                `#trackSector${sectorNumber}`
            );
            if (message.Flag == "YELLOW") {
                trackStatus.innerHTML = "YELLOW";
                trackStatus.className = "yellow";
            }
            if (message.Flag == "DOUBLE YELLOW") {
                trackStatus.innerHTML = "DOUBLE YELLOW";
                trackStatus.className = "orange";
            }
            console.log(message.Message);
            if (message.Flag == "CLEAR") {
                trackStatus.innerHTML = "CLEAR";
                trackStatus.className = "green";
            }
        }
    }
}

apiRequests();

let count = 0;
async function run() {
    getMainHTML();
    addTrackSectors();
    while (true) {
        apiRequests();
        setSession();
        forRaceControlMessages();
        setDRS();
        console.log(count++);
        await sleep(500);
    }
}

run();
