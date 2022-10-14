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
        document.getElementById("background").className = "";
        transparent = false;
    } else {
        document.getElementById("background").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

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
let sessionStartStatus;
let fullTrackStatus;
let oldTrackStatus;

let sessionInfo;
let RCMs;
let laps;
let trackStatus;

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
    trackStatus = JSON.parse(
        httpGet("http://localhost:10101/api/v1/live-timing/TrackStatus")
    );
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
    if (
        message.Category == "Other" &&
        message.Message.includes("HEAD PADDING MATERIAL")
    ) {
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
        headPadding.innerHTML = color;
        headPadding.className = backgroundColor;
    }
}

function setManTyres(message) {
    let tyres;
    if (message.Message.includes("TYRES" || "TIRES")) {
        if (message.Message.includes("USE OF WET WEATHER")) {
            tyres = "INTERMEDIATES";
            backgroundColor = "green";
        } else if (
            message.Message.includes("EXTREME TIRES" || "EXTREME TYRES")
        ) {
            tyres = "FULL WETS";
            backgroundColor = "blue";
        } else {
            tyres = "NONE";
            backgroundColor = "white";
        }
        manTyres.innerHTML = tyres;
        manTyres.className = backgroundColor;
    }
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
            setPitEntry(message);
            setPitExit(message);
        }
    }
}

function getDRS(message) {
    if (message.Category == "Drs") {
        if (message.Message.includes("ENABLED")) {
            drsEnabled = true;
        } else drsEnabled = false;
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

function setPitEntry(message) {
    if (message.SubCategory == "PitEntry") {
        if (pastMessages.includes(JSON.stringify(message))) {
        } else {
            pastMessage += JSON.stringify(message);
            if (message.Message.includes("ENABLED")) {
                drsEnabled = true;
            } else drsEnabled = false;
        }
    }
}

function setPitExit(message) {
    if (message.SubCategory == "PitExit") {
        if (message.Flag == "OPEN") {
            console.log("Open");
            pitExit.innerHTML = "OPEN";
            pitExit.className = "green";
        }
        if (message.Flag == "CLOSED") {
            pitExit.innerHTML = "CLOSED";
            pitExit.className = "red";
        }
    }
}

function setProgress() {}

function setTrackStatus() {
    let status;
    let color;
    let topColor = "white";
    let lines = document.querySelectorAll(".line");
    let heads = document.querySelectorAll("h1");
    switch (+trackStatus.Status) {
        case 1:
            status = "TRACK CLEAR";
            color = "green";
            break;
        case 2:
            status = "YELLOW FLAG";
            color = "yellow";
            topColor = "black";
            break;
        case 4:
            status = "SAFETY CAR";
            color = "orange";
            topColor = "black";
            break;
        case 5:
            status = "RED FLAG";
            color = "red";
            break;
        case 6:
            status = "VIRTUAL SAFETY CAR";
            color = "orange";
            topColor = "black";
            break;
        case 7:
            status = "VIRTUAL SAFETY CAR ENDING";
            color = "orange";
            topColor = "black";
            break;
    }
    if (oldTrackStatus != +trackStatus.Status) {
        fullTrackStatus.innerHTML = status;
        fullTrackStatus.className = color;
        for (i in lines) {
            lines[i].className = "line " + topColor + "-background";
        }
        for (i in heads) {
            heads[i].className = topColor + "-text";
        }
        oldTrackStatus = +trackStatus.Status;
    }
}

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// {Status: "3", Message: ""}
// {Status: "4", Message: "SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}

function setTrackSectors(message) {
    if (message.OriginalCategory == "Flag") {
        if (/\d/.test(message.Message)) {
            let sectorNumber = +message.Message.match(/\d+/)[0];
            let flag = "CLEAR";
            let trackSector = document.querySelector(
                `#trackSector${sectorNumber}`
            );
            if (message.Flag == "YELLOW") {
                trackSector.innerHTML = "YELLOW";
                trackSector.className = "yellow";
            }
            if (message.Flag == "DOUBLE YELLOW") {
                trackSector.innerHTML = "DOUBLE YELLOW";
                trackSector.className = "orange";
            }
            if (message.Flag == "CLEAR") {
                trackSector.innerHTML = "CLEAR";
                trackSector.className = "green";
            }
        }
    }
}

apiRequests();
console.log(RCMs);

let count = 0;
async function run() {
    getMainHTML();
    addTrackSectors();
    while (true) {
        apiRequests();
        setSession();
        forRaceControlMessages();
        setDRS();
        setTrackStatus();
        console.log(count++);
        await sleep(500);
    }
}

run();
