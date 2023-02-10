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
    const configFile = require("../settings/config.json").current;
    const networkConfig = configFile.network;
    const logConfig = configFile.session_log;
    const host = networkConfig.host;
    const port = (await f1mvApi.discoverF1MVInstances(host)).port;
    showLappedDrivers = logConfig.lapped_drivers;
    showRetiredDrivers = logConfig.retired_drivers;
    showRain = logConfig.rain;
    showTeamRadios = logConfig.team_radios;
    showPitstops = logConfig.pitstops;
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
    pitLaneTimeCollection = api.PitLaneTimeCollection ? api.PitLaneTimeCollection.PitTimes : null;
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

async function addLog(driverNumber, type, category, message, color, time, lap) {
    const logs = document.getElementById("logs");

    let newLog = `<div class="log"><div class="type"><p>${category}</p></div><div class="status ${color}"><p>${message}</p></div><div class="time"><p>${time}</p><p>${lap}</p></div></div>`;
    switch (type) {
        case "driver": {
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
            break;
        }
        case "double": {
            newLog = `<div class="log">
            <div class="type">
                <p>${category}</p>
            </div>
            <div class="status double">
                <div class="left ${color[0]}">
                    <p>${message[0]}</p>
                </div>
                <div class="right ${color[1]}">
                    <p>${message[1]}</p>
                </div>
            </div>
            <div class="time">
                <p>${time}</p>
                <p>${lap}</p>
            </div>
        </div>`;
            break;
        }
        case "doubleTeamColor": {
            const driverInfo = driverList[driverNumber];

            const teamColor = driverInfo.TeamColour;
            const firstName = driverInfo.FirstName;
            const lastName = driverInfo.LastName;

            newLog = `<div class="log">
            <div class="type">
                <p>${category}</p>
            </div>
            <div class="status double">
                <div class="left"style="background: linear-gradient(to bottom,transparent 0%,#${teamColor}BF 100%);"><p class="driver-first-name">${firstName}</p><p class="driver-last-name">${lastName}</p></div><div class="right" style="background: linear-gradient(to bottom,transparent 0%,#${teamColor}BF 100%);"><p>${message}</p></div></div><div class="time"><p>${time}</p><p>${lap}</p></div></div>`;
            break;
        }
        case "fastestlap": {
            const driverInfo = driverList[driverNumber];

            const teamColor = driverInfo.TeamColour;
            const firstName = driverInfo.FirstName;
            const lastName = driverInfo.LastName;

            newLog = `<div class="log">
            <div class="type">
                <p>${category}</p>
            </div>
            <div class="status double">
                <div class="left"style="background: linear-gradient(to bottom,transparent 0%,#${teamColor}BF 100%);"><p class="driver-first-name">${firstName}</p><p class="driver-last-name">${lastName}</p></div><div class="right ${color}"><p class="small-text">${message[0]}</p><p>${message[1]}</p></div></div><div class="time"><p>${time}</p><p>${lap}</p></div></div>`;
            break;
        }
        case "penalty": {
            const driverInfo = driverList[driverNumber];

            const teamColor = driverInfo.TeamColour;
            const firstName = driverInfo.FirstName;
            const lastName = driverInfo.LastName;

            newLog = `<div class="log"><div class="type"><p>${category}</p></div><div class="status double"><div class="left"style="background: linear-gradient(to bottom,transparent 0%,#${teamColor}BF 100%);"><p class="driver-first-name">${firstName}</p><p class="driver-last-name">${lastName}</p></div><div class="right ${color}"><p>${message[0]}</p><p class="small-text">${message[1]}</p></div></div><div class="time"><p>${time}</p><p>${lap}</p></div></div>`;
            break;
        }
        case "pitstop": {
            const driverInfo = driverList[driverNumber];

            const teamColor = driverInfo.TeamColour;
            const firstName = driverInfo.FirstName;
            const lastName = driverInfo.LastName;

            console.log(message[3]);

            newLog = `<div class="log">
            <div class="type">
                <p>${category}</p>
            </div>
            <div class="status double">
            <div class="left"style="background: linear-gradient(to bottom,transparent 0%,#${teamColor}BF 100%);"><p class="driver-first-name">${firstName}</p><p class="driver-last-name">${lastName}</p>
                </div>
                <div class="right ${color}">
                    <div class="tires">
                        <div class="prevtires">
                            <img src="${message[0]}" alt="" />
                        </div>
                        <div class="arrow">
                            <img src="${message[1]}" alt="" />
                        </div>
                        <div class="newtires">
                            <img src="${message[2]}" alt="" />
                        </div>
                    </div>
                    <p class="stoptime">${message[3]}</p>
                </div>
            </div>
            <div class="time">
                <p>${time}</p>
                <p>${lap}</p>
            </div>
        </div>`;
            break;
        }
    }

    if (driverNumber) {
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

    let color = "white";
    switch (sessionStatus) {
        case "Started":
            color = "green";
            break;
        case "Aborted":
            color = "red";
            break;
    }

    await addLog(null, "single", "Session Status", sessionStatus, color, time, lap);
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

    await addLog(null, "single", "Track Status", message, color, time, lap);
}

let oldLap = null;
async function addLapCountLog(time, lap, count) {
    const currentLap = parseInt(lapCount.CurrentLap);

    if (oldLap === currentLap) return;

    oldLap = currentLap;

    if (count === 0) return;

    await addLog(null, "single", "Lap Count", `Lap ${currentLap}`, "white", time, lap);
}

let oldWeather = null;
async function addWeatherLog(time, lap, count) {
    const rain = parseInt(weatherData.Rainfall) !== 0 ? true : false;

    if (oldWeather === rain) return;

    oldWeather = rain;

    if (count === 0) return;

    const message = rain ? "Raining" : "Dry";

    const color = rain ? "blue" : "green";

    await addLog(null, "single", "Weather", message, color, time, lap);
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

        await addLog(driver, "driver", "Pitlane", message, color, time, lap);
    }
}

let oldRetirement = {};
async function addRetirementLog(time, lap, count) {
    for (const driver in timingData) {
        const driverTimingData = timingData[driver];

        const retired = driverTimingData.Retired || driverTimingData.Stopped;

        if (!retired || retired === oldRetirement[driver]) continue;

        oldRetirement[driver] = retired;

        if (count === 0) continue;

        const message = "Retired";

        const color = "red";

        await addLog(driver, "driver", "Retirement", message, color, time, lap);
    }
}

let oldLapped = {};
async function addLappedLog(time, lap, count) {
    for (const driver in timingData) {
        const driverTimingData = timingData[driver];

        const retired = driverTimingData.Retired || driverTimingData.Stopped;

        const lapped =
            parseInt(driverTimingData.Position) !== 1 && !retired && driverTimingData.GapToLeader.slice(-1) === "L";

        if (!lapped) continue;

        const lappedCount = parseInt(driverTimingData.GapToLeader.slice(0, 1));

        if (!lapped || lappedCount === oldLapped[driver]) continue;

        oldLapped[driver] = lappedCount;

        if (count === 0) continue;

        const message = "Lapped";

        const color = "white";

        await addLog(driver, "driver", "Position", message, color, time, lap);
    }
}

let oldRadioMessages = [];
async function addNewBoardRadioLog(time, lap, count) {
    for (const radio of teamRadio) {
        const radioString = JSON.stringify(radio);

        if (oldRadioMessages.includes(radioString)) continue;

        oldRadioMessages.push(radioString);

        if (count === 0) continue;

        const message = "New Radio";

        await addLog(radio.RacingNumber, "doubleTeamColor", "Team Radio's", message, "", time, lap);
    }
}

let fastestLapTime = null;
let fastestLapLap = null;
async function addFastestLapLog(time, lap, count) {
    for (const driver in timingStats) {
        const driverTimingData = timingData[driver];
        const driverTimingStats = timingStats[driver];

        if (driverTimingData.Retired || driverTimingData.Stopped) continue;

        const driverBestLap = driverTimingStats.PersonalBestLapTime;

        if (driverBestLap.Position !== 1 || driverBestLap.Value === fastestLapTime) continue;

        if (driverBestLap.Lap <= fastestLapLap) continue;

        fastestLapTime = driverBestLap.Value;
        fastestLapLap = driverBestLap.Lap;

        if (count === 0) continue;

        const message = ["Fastest Lap", driverBestLap.Value];

        const color = "purple";

        await addLog(driver, "fastestlap", "Times", message, color, time, lap);
    }
}

let oldPitstops = [];
async function addPitstopLog(time, lap, count) {
    for (const driver in pitLaneTimeCollection) {
        const driverPitInfo = pitLaneTimeCollection[driver];

        const pitstopString = JSON.stringify(driverPitInfo);

        if (oldPitstops.includes(pitstopString)) continue;

        const driverStints = timingAppData[driver].Stints;

        const lastStint = driverStints.slice(-1)[0];

        if (lastStint.StartLaps !== lastStint.TotalLaps) continue;

        oldPitstops.push(pitstopString);

        if (count === 0) continue;

        console.log(timingAppData[driver].Stints.slice(-2));

        const oldTires = driverStints.slice(-2)[0].Compound.toLowerCase();

        const newtires = driverStints.slice(-1)[0].Compound.toLowerCase();

        console.log(oldTires);
        console.log(newtires);

        const message = [
            `../icons/tires/${oldTires}.png`,
            "../icons/arrowright.png",
            `../icons/tires/${newtires}.png`,
            driverPitInfo.Duration,
        ];

        await addLog(driver, "pitstop", "Pitstop", message, "white", time, lap);

        console.log(driverPitInfo);
    }
}

let oldRaceControlMessages = [];
async function addRaceControlMessageLogs(time, lap, count) {
    for (const raceControlMessage of raceControlMessages) {
        const raceControlMessageString = JSON.stringify(raceControlMessage);

        if (oldRaceControlMessages.includes(raceControlMessageString)) continue;

        oldRaceControlMessages.push(raceControlMessageString);

        // if (count === 0) continue;

        const category = raceControlMessage.SubCategory ? raceControlMessage.SubCategory : raceControlMessage.Category;

        switch (category) {
            case "LapTimeDeleted": {
                const driver = raceControlMessage.Message.match(/\d+/)[0];

                await addLog(driver, "penalty", "Penalty", ["Warning", "Track Limits"], "orange", time, lap);
                break;
            }
            case "TimePenalty": {
                const amount = raceControlMessage.Message.match(/\d+/)[0];
                const driver = raceControlMessage.Message.split("CAR")[1].match(/\d+/)[0];

                console.log(driver);

                console.log(raceControlMessage.Message.match(/\d+/));

                await addLog(driver, "penalty", "Penalty", [`${amount} Seconds`, "Time Penalty"], "red", time, lap);
                break;
            }
            case "TrackSurfaceSlippery": {
                const words = raceControlMessage.Message.split("IN")[1].split(" ");

                console.log(words);

                let message = "Slippery ";
                for (const word of words) {
                    if (word === "") continue;
                    message += `${word[0].toUpperCase() + word.slice(1).toLowerCase()} `;
                }

                await addLog(null, "single", "Track Status", message, "orange", time, lap);

                console.log(message);

                break;
            }
            case "PitEntry": {
                let message = "Open";
                let color = "green";
                if (raceControlMessage.Flag === "CLOSED") {
                    message = "Closed";
                    color = "red";
                }

                await addLog(null, "double", "Pitlane", ["Pit Entry", message], ["blue", color], time, lap);
                break;
            }

            case "PitExit": {
                let message = "Open";
                let color = "green";
                if (raceControlMessage.Flag === "CLOSED") {
                    message = "Closed";
                    color = "red";
                }

                await addLog(null, "double", "Pitlane", ["Pit Exit", message], ["blue", color], time, lap);
                break;
            }
            case "Drs": {
                let message = "Enabled";
                let color = "green";

                if (raceControlMessage.Flag === "DISABLED") {
                    message = "Disabled";
                    color = "red";
                }

                await addLog(null, "double", "Track Information", ["DRS", message], ["green", color], time, lap);
                break;
            }
        }
    }
}

function removeLogs() {
    const logs = document.getElementById("logs");

    const logHeight = logs.firstChild.offsetHeight;

    const windowHeight = window.innerHeight;

    const windowCount = Math.ceil(windowHeight / logHeight);

    const logCount = logs.childElementCount;

    for (let logIndex = windowCount; logIndex < logCount; logIndex++) {
        const logs = document.getElementById("logs");

        logs.removeChild(logs.firstChild);
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
        if (sessionType === "Race") await addLapCountLog(time, lap, count);
        if (showRain) await addWeatherLog(time, lap, count);
        await addPitlaneLog(time, lap, count);
        if (showRetiredDrivers) await addRetirementLog(time, lap, count);
        if (sessionType === "Race" && showLappedDrivers) await addLappedLog(time, lap, count);
        if (showTeamRadios) await addNewBoardRadioLog(time, lap, count);
        await addFastestLapLog(time, lap, count);
        if (sessionType === "Race" && showPitstops) await addPitstopLog(time, lap, count);
        await addRaceControlMessageLogs(time, lap, count);
        await removeLogs();
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
