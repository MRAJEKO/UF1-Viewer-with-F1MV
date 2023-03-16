const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function parseTime(time) {
    console.log(time);
    const [seconds, minutes, hours] = time
        .split(":")
        .reverse()
        .map((number) => parseInt(number));

    if (hours === undefined) return (minutes * 60 + seconds) * 1000;

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
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

async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_store")).config.network;
    host = config.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

async function setTime() {
    const config = {
        host: host,
        port: port,
    };

    const api = await f1mvApi.LiveTimingAPIGraphQL(config, "SessionInfo");

    const utcOffset = parseTime(api.SessionInfo.GmtOffset);

    const clockData = await f1mvApi.LiveTimingClockAPIGraphQL(config, ["paused", "systemTime", "trackTime"]);

    const now = new Date();
    const systemTime = clockData.systemTime;
    const trackTime = clockData.trackTime;
    const paused = clockData.paused;

    const localTime = parseInt(paused ? trackTime : now - (systemTime - trackTime)) + utcOffset;

    const displayTime = getTime(localTime);

    document.getElementById("time").textContent = displayTime;
}

async function run() {
    await getConfigurations();

    await setTime();
    setInterval(async () => {
        await setTime();
    }, 500);
}

run();
