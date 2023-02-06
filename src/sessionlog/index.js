const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

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
    const configFile = (await ipcRenderer.invoke("get_config")).current.network;
    const host = configFile.host;
    const port = (await f1mvApi.discoverF1MVInstances(host)).port;
    config = {
        host: host,
        port: port,
    };
}

async function apiRequests() {
    const api = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "DriverList",
        "ExtrapolatedClock",
        "LapCount",
        "PitLaneTimeCollection",
        "RaceControlMessages",
        "SessionData",
        "SessionInfo",
        "SessionStatus",
        "TeamRadio",
        "TimingAppData",
        "TimingData",
        "TimingStats",
        "TrackStatus",
        "WeatherData",
    ]);
    console.log(api);
    driverList = api.DriverList;
    extrapolatedClock = api.ExtrapolatedClock;
    lapCount = api.LapCount;
    pitLaneTimeCollection = api.PitLaneTimeCollection.PitTimes;
    raceControlMessages = api.RaceControlMessages.Messages;
    sessionData = api.SessionData;
    sessionInfo = api.SessionInfo;
    sessionType = sessionInfo.Type;
    sessionStatus = api.SessionStatus.Status;
    teamRadio = api.TeamRadio.Captures;
    timingAppData = api.TimingAppData.Lines;
    timingData = api.TimingData.Lines;
    timingStats = api.TimingStats.Lines;
    trackStatus = api.TrackStatus;
    weatherData = api.WeatherData;

    clockData = await f1mvApi.LiveTimingClockAPIGraphQL(config, ["paused", "systemTime", "trackTime"]);
}

function parseTime(time) {
    [seconds, minutes, hours] = time
        .split(":")
        .map((number) => parseInt(number))
        .reverse();

    if (hours === undefined) return (minutes * 60 + seconds) * 1000;

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function getTimezoneName(offset) {
    const hoursOffsetoffset = offset / 3600000;

    switch (hoursOffsetoffset) {
        case -12:
            return "IDLW";
        case -11:
            return "NT";
        case -10:
            return "HST";
        case -9:
            return "AKST";
        case -8:
            return "PST";
        case -7:
            return "MST";
        case -6:
            return "CST";
        case -5:
            return "EST";
        case -4:
            return "AST";
        case -3:
            return "ADT";
        case -2:
            return "NDT";
        case -1:
            return "WAT";
        case 0:
            return "GMT";
        case 1:
            return "CET";
        case 2:
            return "EET";
        case 3:
            return "MSK";
        case 4:
            return "AZT";
        case 5:
            return "GET";
        case 6:
            return "ALMT";
        case 7:
            return "ICT";
        case 8:
            return "HKT";
        case 9:
            return "JST";
        case 10:
            return "AEST";
        case 11:
            return "ACST";
        case 12:
            return "NZST";
        default:
            return "UTC";
    }
}

function getTime(ms) {
    const date = new Date(ms);

    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");

    if (parseInt(hours) === 0) {
        return `${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
}

async function addLog(driverNumber, category, message, color, time, lap) {
    const logs = document.getElementById("logs");

    let newLog = `<div class="log"><div class="type"><p>${category}</p></div><div class="status ${color}"><p>${message}</p></div><div class="time"><p>${time}</p><p>${lap}</p></div></div>`;
    if (driverNumber) {
        const driverInfo = driverList[driverNumber];

        const teamColor = driverInfo.TeamColour;
        const firstName = driverInfo.FirstName;
        const lastName = driverInfo.LastName;

        newLog = `<div class="log">
        <div class="type">
            <p>${category}</p>
        </div>
        <div class="status double">
            <div
                class="left"
                style="
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        #${teamColor}BF 100%
                    );
                ">
                <p class="driver-first-name">${firstName}</p>
                <p class="driver-last-name">${lastName}</p>
            </div>
            <div class="right ${color}">
                <p>${message}</p>
            </div>
        </div>
        <div class="time">
            <p>${time}</p>
            <p>${lap}</p>
        </div>
    </div>`;
    }

    const newWrapper = document.createElement("div");
    newWrapper.classList.add("wrapper");
    newWrapper.innerHTML = newLog;

    logs.appendChild(newWrapper);

    await sleep(10);

    newWrapper.classList.add("shown");
}

function getLogTime() {
    const now = new Date();
    const systemTime = clockData.systemTime;
    const trackTime = clockData.trackTime;
    const paused = clockData.paused;

    const offset = parseTime(sessionInfo.GmtOffset);

    const timezone = getTimezoneName(offset);

    const localTime = parseInt(paused ? trackTime : now - (systemTime - trackTime)) + offset;

    const displayTime = getTime(localTime);

    return `${displayTime} ${timezone}`;
}

let oldSessionStatus = null;
async function addSessionStatusLog(time, lap, count) {
    if (oldSessionStatus === sessionStatus) return;
    oldSessionStatus = sessionStatus;

    if (count === 0) return;

    const logs = document.getElementById("logs");

    let color = "white";
    switch (sessionStatus) {
        case "Started":
            color = "green";
            break;
        case "Aborted":
            color = "red";
            break;
    }

    await addLog(null, "Session Status", sessionStatus, color, time, lap);
}

let oldTrackStatus = null;
async function addTrackStatusLog(time, lap, count) {
    const status = parseInt(trackStatus.Status);

    if (oldTrackStatus === status) return;
    oldTrackStatus = status;

    if (count === 0) return;

    let message = "Track Clear";
    let color = "green";
    switch (status) {
        case 2:
            message = "Yellow Flag";
            color = "yellow";
            break;
        case 4:
            message = "Safety Car Deployed";
            color = "orange";
            break;
        case 5:
            message = "Red Flag";
            color = "red";
            break;
        case 6:
            message = "Virtual Safety Car Deployed";
            color = "orange";
            break;
        case 7:
            message = "Virtual Safety Car Ending";
            color = "yellow";
            break;
    }

    await addLog(null, "Track Status", message, color, time, lap);
}

let oldLap = null;
async function addLapCountLog(time, lap, count) {
    const currentLap = parseInt(lapCount.CurrentLap);

    if (oldLap === currentLap) return;

    oldLap = currentLap;

    if (count === 0) return;

    await addLog(null, "Lap Count", `Lap ${currentLap}`, "white", time, lap);
}

let oldWeather = null;
async function addWeatherLog(time, lap, count) {
    const rain = parseInt(weatherData.Rainfall) !== 0 ? true : false;

    if (oldWeather === rain) return;

    oldWeather = rain;

    if (count === 0) return;

    const message = rain ? "Raining" : "Dry";

    const color = rain ? "blue" : "green";

    await addLog(null, "Weather", message, color, time, lap);
}

let oldPitlane = {};
async function addPitlaneLog(time, lap, count) {
    for (const driver in timingData) {
        const driverTimingData = timingData[driver];

        if (driverTimingData.Retired || driverTimingData.Stopped) continue;

        if (driverTimingData.InPit === oldPitlane[driver]) continue;

        oldPitlane[driver] = driverTimingData.InPit;

        if (count === 0) continue;

        const message = driverTimingData.InPit ? "Pit In" : "Pit Out";

        const color = driverTimingData.InPit ? "red" : "green";

        await addLog(driver, "Pitlane", message, color, time, lap);
    }
}

let oldRetirement = {};
async function addRetirementLog(time, lap, count) {
    for (const driver in timingData) {
        const driverTimingData = timingData[driver];

        const retired = driverTimingData.Retired || driverTimingData.Stopped;

        console.log(retired);

        if (!retired || retired === oldRetirement[driver]) continue;

        oldRetirement[driver] = retired;

        if (count === 0) continue;

        const message = "Retired";

        const color = "red";

        await addLog(driver, "Retirement", message, color, time, lap);
    }
}

async function run() {
    await getConfigurations();
    let count = 0;
    while (true) {
        await sleep(500);
        await apiRequests();
        const time = getLogTime();
        const lap = sessionType === "Race" ? `LAP ${lapCount.CurrentLap}` : "";
        await addSessionStatusLog(time, lap, count);
        await addTrackStatusLog(time, lap, count);
        await addLapCountLog(time, lap, count);
        await addWeatherLog(time, lap, count);
        await addPitlaneLog(time, lap, count);
        await addRetirementLog(time, lap, count);
        count++;
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
