const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

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
async function getConfigurations() {
    const networkConfig = (await ipcRenderer.invoke("get_store")).config.network;
    host = networkConfig.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
}

let sessionInfo;

// Requesting the information needed from the api
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };
    const data = await f1mvApi.LiveTimingAPIGraphQL(config, ["TrackStatus", "RaceControlMessages", "SessionInfo"]);
    trackStatus = data.TrackStatus;
    raceControlMessages = data.RaceControlMessages.Messages;
    sessionInfo = data.SessionInfo;
}

function parseTime(time) {
    console.log(time);
    const [seconds, minutes, hours] = time
        .split(":")
        .reverse()
        .map((number) => parseInt(number));

    if (hours === undefined) return (minutes * 60 + seconds) * 1000;

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function parseLapTime(lapTime) {
    const [minutes, seconds, milliseconds] = lapTime
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) {
        return minutes + seconds / 1000;
    }

    return minutes * 60 + seconds + milliseconds / 1000;
}

function getTime(ms) {
    const date = new Date(ms);

    console.log(date);

    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");

    if (parseInt(hours) === 0) {
        return `${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
}

async function addTrackSectors() {
    const circuitId = sessionInfo.Meeting.Circuit.Key;

    const year = new Date(sessionInfo.StartDate).getFullYear();

    const sectorCount = (await f1mvApi.getCircuitInfo(circuitId, year)).marshalSectors.length;

    const container = document.getElementById("wrapper");

    for (let count = 1; count <= sectorCount; count++) {
        const newStatus = `<span class="status"><h2>SECTOR ${count}</h2><p id="sector${count}" class="green">CLEAR</p></span>`;
        container.innerHTML += newStatus;
    }
}

function setFullStatus() {
    const status = parseInt(trackStatus.Status);

    let message = "TRACK CLEAR";
    let color = "green";
    switch (status) {
        case 2:
            message = "YELLOW FLAG";
            color = "yellow";
            break;
        case 4:
            message = "SC DEPLOYED";
            color = "yellow";
            break;
        case 5:
            message = "RED FLAG";
            color = "red";
            break;
        case 6:
            message = "VSC DEPLOYED";
            color = "yellow";
            break;
        case 7:
            message = "VSC ENDING";
            color = "yellow";
            break;
    }

    const fullStatusElement = document.getElementById("track-status");

    fullStatusElement.textContent = message;
    fullStatusElement.className = color;
}

let pastRaceControlMessages = [];
function setTrackSector() {
    for (const message of raceControlMessages) {
        if (pastRaceControlMessages.includes(JSON.stringify(message))) continue;

        pastRaceControlMessages.push(JSON.stringify(message));

        if (message.Category === "Flag" && message.Scope === "Track" && message.Flag === "CLEAR") {
            const allSectorElements = document.getElementsByClassName("status");

            for (const sectorElement of allSectorElements) {
                sectorElement.children[1].textContent = "CLEAR";
                sectorElement.children[1].className = "green";
            }
        }

        if (
            (message.Category !== "Flag" || message.Scope !== "Sector") &&
            message.SubCategory !== "TrackSurfaceSlippery"
        )
            continue;

        let sector = message.Sector;

        let flag = message.Flag;

        if (sector === undefined) {
            sector = message.Message.match(/(\d+)/)[0];
            flag = "SLIPPERY";
        }

        let color = "green";
        switch (flag) {
            case "YELLOW":
                color = "yellow";
                break;
            case "DOUBLE YELLOW":
                color = "orange";
                break;
            case "SLIPPERY":
                color = "slippery";
        }

        const sectorElement = document.getElementById(`sector${sector}`);
        sectorElement.textContent = flag;
        sectorElement.className = color;
    }
}

async function run() {
    await getConfigurations();
    await apiRequests();
    await addTrackSectors();
    while (true) {
        await apiRequests();
        setFullStatus();
        setTrackSector();
        await sleep(500);
    }
}

run();

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// event 3 has never been seen
// {"Status":"4","Message":"SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
