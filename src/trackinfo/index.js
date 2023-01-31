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

// Set global variables
const qualiPartLengths = ["00:18:00", "00:15:00", "00:12:00"];
const extraTime = "01:00:00";

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_config")).current.trackinfo;
    const networkConfig = (await ipcRenderer.invoke("get_config")).current.network;
    dynamicTextColor = configFile.dynamic_text_color;
    const defaultBackgroundColor = configFile.default_background_color;
    const orientation = configFile.orientation;
    const styleType = orientation === "vertical" ? "w" : "h";
    const h2Elements = document.querySelectorAll("h2");
    for (const element of h2Elements) {
        element.classList.add(`h2${styleType}`);
    }
    const pElements = document.querySelectorAll("p");
    for (const element of pElements) {
        element.classList.add(`p${styleType}`);
    }
    pClass = `p${styleType}`;
    document.getElementById("wrapper").classList.add(`wrapper${styleType}`);
    document.getElementById("container").classList.add(`container${styleType}`);

    if (orientation === "horizontal") {
        document.getElementById("session-name-container").style.display = "none";
    }

    host = networkConfig.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(dynamicTextColor);
        console.log(defaultBackgroundColor);
    }
    if (defaultBackgroundColor === "transparent") {
        document.getElementById("background").style.backgroundColor = "gray";
        document.getElementById("background").className = "transparent";
        transparent = true;
    } else {
        document.getElementById("background").style.backgroundColor = defaultBackgroundColor;
    }
}

let sessionInfo;

// Requesting the information needed from the api
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };
    const data = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "LapCount",
        "TrackStatus",
        "SessionStatus",
        "TimingData",
        "TimingStats",
        "ExtrapolatedClock",
        "SessionData",
        "RaceControlMessages",
        "SessionInfo",
    ]);
    lapCount = data.LapCount;
    trackStatus = data.TrackStatus;
    sessionStatus = data.SessionStatus.Status;
    timingData = data.TimingData;
    timingStats = data.TimingStats.Lines;
    extrapolatedClock = data.ExtrapolatedClock;
    sessionData = data.SessionData;
    raceControlMessages = data.RaceControlMessages.Messages;
    sessionInfo = data.SessionInfo;
    console.log(data);
    clockData = await f1mvApi.LiveTimingClockAPIGraphQL(config, [
        "paused",
        "systemTime",
        "trackTime",
        "liveTimingStartTime",
    ]);
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

// Set the status from the session
function setSession() {
    let status = "ONSCHEDULE";
    let color = "green";
    switch (sessionStatus) {
        case "Started":
            status = "ONGOING";
            break;
        case "Aborted":
            status = "SUSPENDED";
            color = "red";
            break;
        case "Finished":
        case "Finalised":
        case "Ends":
            status = "FINISHED";
            color = "gray";
            break;
        case "Inactive":
            for (const message of raceControlMessages) {
                if (!message.Message.includes("DELAYED")) break;
                status = "DELAYED";
                color = "orange";
            }
            break;
    }

    const statusElement = document.getElementById("session");
    statusElement.textContent = status;
    statusElement.className = `${pClass} ${color}`;

    const sessionNameElement = document.getElementById("session-name");
    sessionNameElement.textContent = sessionInfo.Name.toUpperCase();
}

// Setting the timers for the current session
function setTrackTime() {
    const now = new Date();
    const systemTime = clockData.systemTime;
    const trackTime = clockData.trackTime;
    const paused = clockData.paused;

    const offset = parseTime(sessionInfo.GmtOffset);

    console.log(offset);

    console.log(now.getTime());
    console.log(systemTime);
    console.log(trackTime);

    const localTime = parseInt(paused ? trackTime : now - (systemTime - trackTime)) + offset;

    const displayTime = getTime(localTime);

    const color = paused ? "gray" : "green";

    const trackTimeElement = document.getElementById("time");
    trackTimeElement.innerHTML = displayTime;
    trackTimeElement.className = `${pClass} ${color}`;
}

function setSessionTimer() {
    const now = new Date();
    const paused = clockData.paused;
    const extrapolatedClockStart = new Date(extrapolatedClock.Utc);
    const extrapolatedTime = extrapolatedClock.Remaining;
    const systemTime = clockData.systemTime;
    const trackTime = clockData.trackTime;
    const extrapolating = extrapolatedClock.Extrapolating;

    const sessionDuration = parseTime(extrapolatedTime) + 1000;

    console.log(sessionDuration);

    const timer = extrapolating
        ? paused
            ? getTime(sessionDuration - (trackTime - extrapolatedClockStart))
            : getTime(sessionDuration - (now - (systemTime - trackTime) - extrapolatedClockStart))
        : extrapolatedTime;

    const color = paused ? "gray" : extrapolating ? "green" : "gray";

    const sessionTimerElement = document.getElementById("session-timer");
    sessionTimerElement.textContent = timer;
    sessionTimerElement.className = `${pClass} ${color}`;

    return parseTime(timer);
}

function setExtraTimer() {
    if (sessionInfo.Type !== "Race") {
        const extraTimerContainerElement = document.getElementById("extra-timer-container");
        extraTimerContainerElement.className = "hidden";
        return;
    }

    const extraTimerElement = document.getElementById("extra-timer");
    let color = "gray";
    let displayTime;

    const now = new Date();
    const paused = clockData.paused;
    const systemTime = clockData.systemTime;
    const trackTime = clockData.trackTime;
    const extrapolatedClockStart = new Date(extrapolatedClock.Utc);

    let extraTimeUsed = 0;
    let aborted = false;
    let startTime = 0;
    for (const status of sessionData.StatusSeries) {
        if (aborted && status.SessionStatus === "Started") {
            extraTimeUsed = new Date(status.Utc) - startTime;
            aborted = false;
            continue;
        }

        if (status.SessionStatus === "Aborted") {
            startTime = new Date(status.Utc);
            aborted = true;
        }
    }

    const extraTimeMs = parseTime(extraTime);

    const remaining = extraTimeMs - extraTimeUsed;

    if (sessionStatus === "Aborted" && !extrapolatedClock.Extrapolating) {
        displayTime = paused
            ? getTime(remaining - (trackTime - extrapolatedClockStart))
            : getTime(remaining - (now - (systemTime - trackTime) - extrapolatedClockStart));
        color = "green";
    } else {
        displayTime = remaining > 0 ? getTime(remaining) : getTime(0);
    }

    extraTimerElement.textContent = displayTime;
    extraTimerElement.className = `${pClass} ${color}`;
}

function setProgress(timer) {
    const sessionLength = new Date(sessionInfo.EndDate) - new Date(sessionInfo.StartDate);

    const progressElement = document.getElementById("progress");

    let totalTimers = sessionLength;

    if (sessionInfo.Type === "Race") {
        const qualiPartContainerElement = document.getElementById("quali-part-container");
        qualiPartContainerElement.className = "hidden";

        let fastestLap = 0;
        for (const driverNumber in timingStats) {
            const driverTimingStats = timingStats[driverNumber];

            if (driverTimingStats.PersonalBestLapTime.Position === 1) {
                fastestLap = parseLapTime(driverTimingStats.PersonalBestLapTime.Value);
                break;
            }
        }

        console.log(timer);

        const finished = sessionStatus === "Finished" || sessionStatus === "Finalised" || sessionStatus === "Ends";

        const maxLaps =
            fastestLap === 0
                ? lapCount.TotalLaps
                : finished
                ? lapCount.CurrentLap
                : Math.ceil(timer / (fastestLap * 1000) + lapCount.CurrentLap + 1);

        const maxLapPercentage = Math.floor((maxLaps / lapCount.TotalLaps) * 100);
        const color = finished
            ? "gray"
            : maxLaps < lapCount.TotalLaps
            ? maxLapPercentage <= 75
                ? "red"
                : "orange"
            : "green";

        console.log(lapCount.CurrentLap / lapCount.TotalLaps);

        const lapPercentage = Math.floor((lapCount.CurrentLap / lapCount.TotalLaps) * 100);

        progressElement.textContent =
            maxLapPercentage === 100 && finished
                ? "CONCLUDED"
                : `${lapPercentage === 100 ? "99" : lapPercentage}% - ${
                      maxLapPercentage > 100 ? "100" : maxLapPercentage
                  }%`;
        progressElement.className = `${pClass} ${color}`;

        const displayLapCount = `${lapCount.CurrentLap}/${maxLaps > lapCount.TotalLaps ? lapCount.TotalLaps : maxLaps}`;

        const lapCountElement = document.getElementById("lapcount");

        lapCountElement.textContent = displayLapCount;
        lapCountElement.className = `${pClass} ${color}`;
    } else {
        const lapCountContainerElement = document.getElementById("lapcount-container");
        lapCountContainerElement.className = "hidden";

        if (sessionInfo.Type === "Qualifying") {
            const qualiPartElement = document.getElementById("quali-part");

            const qualiPart = timingData.SessionPart;
            totalTimers = parseTime(qualiPartLengths[qualiPart - 1]);

            qualiPartElement.textContent = `Q${qualiPart} - Q${qualiPartLengths.length}`;
            qualiPartElement.classList = `${pClass} ${timer === 0 && qualiPart === 3 ? "gray" : "green"}`;
        } else {
            const qualiPartContainerElement = document.getElementById("quali-part-container");
            qualiPartContainerElement.className = "hidden";
        }

        const timerProgress = totalTimers - timer;

        const progress = Math.floor((timerProgress / totalTimers) * 100);

        const max = 100;

        const sessionEnded = timer === 0;

        const displayProgress = sessionEnded ? "CONCLUDED" : `${progress}% - ${max}%`;

        progressElement.textContent = displayProgress;
        progressElement.className = `${pClass} ${sessionEnded ? "gray" : "green"}`;

        console.log(progress);

        console.log(timer);
        console.log(totalTimers);
    }
}

function setPitlane(message) {
    if (
        !(
            message.SubCategory === "PitEntry" ||
            message.SubCategory === "PitExit" ||
            message.Flag === "RED" ||
            (message.Flag === "CLEAR" && sessionStatus === "Aborted")
        )
    )
        return;

    const pitExitElement = document.getElementById(`pit-exit`);

    switch (message.Flag) {
        case "RED":
            pitExitElement.textContent = "CLOSED";
            pitExitElement.className = `${pClass} red`;
            return;
        case "CLEAR":
            pitExitElement.textContent = "OPEN";
            pitExitElement.className = `${pClass} green`;
            return;
    }

    const type = message.SubCategory === "PitEntry" ? "entry" : "exit";

    let status = "CLOSED";
    let color = "red";
    switch (message.Flag) {
        case "OPEN":
            status = "OPEN";
            color = "green";
            break;
        case "CLOSED":
            status = "CLOSED";
            color = "red";
            break;
    }

    const pitLaneElement = document.getElementById(`pit-${type}`);
    pitLaneElement.textContent = status;
    pitLaneElement.className = `${pClass} ${color}`;
}

// Setting the grip status to the information screen
function setGrip(message) {
    switch (message.SubCategory) {
        case "LowGripConditions":
            grip = "LOW";
            color = "orange";
            break;
        case "NormalGripConditions":
            grip = "NORMAL";
            color = "green";
            break;
        default:
            return;
    }

    const gripElement = document.getElementById("grip");
    gripElement.textContent = grip;
    gripElement.className = `${pClass} ${color}`;
}

function setHeadPadding(message) {
    if (!(message.Category === "Other" && message.Message.includes("HEAD PADDING MATERIAL"))) return;

    let padding = "UNKNOWN";
    let color = "white";
    if (message.Message.includes("BLUE")) {
        padding = "BLUE";
        color = "blue";
    } else if (message.Message.includes("LIGHT BLUE")) {
        padding = "LIGHT BLUE";
        color = "light-blue";
    } else if (message.Message.includes("PINK")) {
        padding = "PINK";
        color = "pink";
    }
    const headPaddingElement = document.getElementById("head-padding");

    headPaddingElement.textContent = padding;
    headPaddingElement.className = `${pClass} ${color}`;
}

function setDrs(message) {
    const category = message.Category;

    if (!(category === "Drs" || message.Flag === "RED")) return;

    let status = "DISABLED";
    let color = "red";
    if (message.Category === "Drs") {
        switch (message.Status) {
            case "DISABLED":
                status = message.Status;
                color = "red";
                break;
            case "ENABLED":
                status = message.Status;
                color = "green";
                break;
        }
    }

    const drsElement = document.getElementById("drs");
    drsElement.textContent = status;
    drsElement.className = `${pClass} ${color}`;
}

function setManTires(message) {
    if (!message.Message.includes("TYRES" || "TIRES")) return;

    let tires = "NONE";
    let color = "white";

    if (message.Message.includes("USE OF WET WEATHER")) {
        tires = "INTERMEDIATES";
        backgroundColor = "green";
    } else if (message.Message.includes("EXTREME TIRES" || "EXTREME TYRES")) {
        tires = "FULL WETS";
        backgroundColor = "blue";
    }

    const manTiresElement = document.getElementById("tires");
    manTiresElement.textContent = tires;
    manTiresElement.className = `${pClass} ${color}`;
}

const pastMessages = [];
function forRaceControlMessages() {
    for (const message of raceControlMessages) {
        if (pastMessages.includes(JSON.stringify(message))) continue;
        pastMessages.push(JSON.stringify(message));
        console.log(message);
        setGrip(message);
        setHeadPadding(message);
        setDrs(message);
        setPitlane(message);
    }
}

// Running all the functions
let count = 0;
async function run() {
    await getConfigurations();
    await apiRequests();
    while (true) {
        await apiRequests();
        setSession();
        setTrackTime();
        const timer = setSessionTimer();
        setExtraTimer();
        setProgress(timer);
        forRaceControlMessages();
        if (debug) {
            console.log(count++);
        }
        await sleep(1000);
    }
}

// Running the whole screen
run();
