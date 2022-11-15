const { ipcRenderer } = require("electron");

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

let localTimeUTC = JSON.parse(
    httpGet(`http://${host}:${port}/api/v1/live-timing/Heartbeat`)
).Utc;

let trackTimezoneOffset = JSON.parse(
    httpGet(`http://${host}:${port}/api/v1/live-timing/SessionInfo`)
).GmtOffset.split(":")[0];

let localDate;

function adjustDate(input) {
    let date = new Date(input);
    let localDateMil = new Date(date.getTime() + trackTimezoneOffset * 3600000);
    localDate = localDateMil;
}

let currentTime = localTimeUTC;
let previousTime = localTimeUTC;

let t;

async function addSecond() {
    let formatDate = new Date(localDate.getTime() + 1000);
    let hh = formatDate.getUTCHours();
    let mm = formatDate.getUTCMinutes();
    let ss = formatDate.getSeconds();

    hh = hh < 10 ? "0" + hh : hh;
    mm = mm < 10 ? "0" + mm : mm;
    ss = ss < 10 ? "0" + ss : ss;

    let time = hh + ":" + mm + ":" + ss;

    localDate = formatDate;

    document.getElementById("time").innerText = time;
    t = setTimeout(function () {
        addSecond();
    }, 993);
}

async function getTime() {
    await getConfigurations();
    while (currentTime === previousTime) {
        localTimeUTC = JSON.parse(
            httpGet(`http://${host}:${port}/api/v1/live-timing/Heartbeat`)
        ).Utc;
        currentTime = localTimeUTC;
        await sleep(100);
    }
    if (currentTime !== previousTime) {
        previousTime = currentTime;
        await sleep(2200);
        adjustDate(currentTime);
        getTime();
        clearTimeout(t);
        addSecond();
    }
}

let transparent = false;

function toggleBackground() {
    if (transparent) {
        document.getElementById("time").className = "";
        transparent = false;
    } else {
        document.getElementById("time").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

getTime();
