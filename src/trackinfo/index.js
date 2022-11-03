const debug = true;

if (debug) {
    console.log(window.myAPI);
}
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

// Empty global variables
let api;
let maxProgress;
let statusContainer;
let delayed;
let headPaddingMaterial;
let backgroundColor;
let drsZoneNumber;
let sessionStartStatus;
let oldTrackStatus;
let timer;

// Set global variables
let drsEnabled = true;
let pastMessages = [];
let grip = "NORMAL";
let color = "green";
let redFlag = false;
let fullTimerRemaining = 3600000;
let fullSessionTimer = new Date(fullTimerRemaining).toLocaleTimeString(
    "en-GB",
    {
        timeZone: "UTC",
    }
);

// Global HTML elements
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
let fullTrackStatus;
let gripConditions;
let trackTimeElement;
let qProgressElement;
let totalQProgressElement;

// API requests
let RCMs;
let laps;
let trackStatus;
let timingData;
let extraPolatedClock;
let sessionData;
let clockData;

let sessionInfo = JSON.parse(
    httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
);
// Requesting the information needed from the api
function apiRequests() {
    if (sessionInfo.Type == "Race") {
        api = JSON.parse(
            httpGet(
                "http://localhost:10101/api/v2/live-timing/state/LapCount,TrackStatus,SessionStatus,TimingData,ExtrapolatedClock,SessionData,RaceControlMessages"
            )
        );
        laps = api.LapCount;
        trackStatus = api.TrackStatus;
        sessionStartStatus = api.SessionStatus;
        timingData = api.TimingData;
        extraPolatedClock = api.ExtrapolatedClock;
        sessionData = api.SessionData;
        RCMs = api.RaceControlMessages;
        if (debug) {
            console.log(laps);
            console.log(trackStatus);
            console.log(sessionStartStatus);
            console.log(timingData);
            console.log(extraPolatedClock);
            console.log(sessionData);
            console.log(RCMs);
        }
    } else {
        api = JSON.parse(
            httpGet(
                "http://localhost:10101/api/v2/live-timing/state/TrackStatus,SessionStatus,TimingData,ExtrapolatedClock,SessionData,RaceControlMessages"
            )
        );
        trackStatus = api.TrackStatus;
        sessionStartStatus = api.SessionStatus;
        timingData = api.TimingData;
        extraPolatedClock = api.ExtrapolatedClock;
        sessionData = api.SessionData;
        RCMs = api.RaceControlMessages;
    }

    clockData = JSON.parse(
        httpGet("http://localhost:10101/api/v2/live-timing/Clock")
    );
}

// Adding a list of all the track sectors from a track to the screen
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

// Get all the HTML elements where information needs to be set
function getMainHTML() {
    statusContainer = document.getElementById("statuses");
    sessionStatus = document.querySelector("#session-status");
    lapCount = document.querySelector("#lap-count");
    sessionTimerElement = document.querySelector("#timer1");
    fullSessionTimerElement = document.querySelector("#timer2");
    headPadding = document.querySelector("#head-material p");
    drs = document.querySelector("#drs p");
    manTyres = document.querySelector("#tyres p");
    pitEntry = document.querySelector("#pit-entry p");
    pitExit = document.querySelector("#pit-exit p");
    currentProgress = document.querySelector("#percentage-count");
    fullTrackStatus = document.querySelector("#sector-info #head p");
    gripConditions = document.querySelector("#grip p");
    trackTimeElement = document.querySelector("#track-time");
    totalQProgressElement = document.querySelector("#total-q-progress");
}

// Set the status from the session
function setSession() {
    let status = sessionStartStatus.Status;
    if (status == "Aborted") {
        status = "SUSPENDED";
        backgroundColor = "red";
        delayed = false;
    } else if (status == "Started") {
        status = "ONGOING";
        backgroundColor = "green";
        delayed = false;
    } else if (
        status == "Finished" ||
        status == "Finalised" ||
        status == "Ends"
    ) {
        status = "FINISHED";
        backgroundColor = "gray";
        delayed = false;
    }
    if (status == "Inactive" && delayed != true) {
        if (delayed) {
            status = "DELAYED";
            backgroundColor = "orange";
            delayed = true;
        } else {
            for (i in RCMs.Messages) {
                if (
                    RCMs.Messages[i].Message.includes("SUSPENDED") ||
                    RCMs.Messages[i].Message.includes("DELAYED")
                ) {
                    status = "DELAYED";
                    backgroundColor = "orange";
                    delayed = true;
                } else {
                    status = "ONSCHEDULE";
                    backgroundColor = "gray";
                }
            }
        }
    }

    sessionStatus.innerHTML = status;
    sessionStatus.className = backgroundColor;
}

// Set the color of head padding needed to be used for the session
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

// Set the manditory tires needed to be used for the session
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

// Get the current DRS status (excluding different zones)
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

// Setting the DRS status to the information screen
function setDRS() {
    if (drsEnabled) {
        drs.innerHTML = "ENABLED";
        drs.className = "green";
    } else {
        drs.innerHTML = "DISABLED";
        drs.className = "red";
    }
}

// Setting the pit entry status to the information screen
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

// Setting the pit exit status to the information screen
function setPitExit(message) {
    if (message.SubCategory == "PitExit") {
        if (message.Flag == "OPEN") {
            pitExit.innerHTML = "OPEN";
            pitExit.className = "green";
        }
        if (message.Flag == "CLOSED") {
            pitExit.innerHTML = "CLOSED";
            pitExit.className = "red";
        }
    }
}

// Setting the full track status to the information screen
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
            if (redFlag == true) {
                pitExit.innerHTML = "OPEN";
                pitExit.className = "green";
            }
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
            pitExit.innerHTML = "CLOSED";
            pitExit.className = "red";
            redFlag = true;
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

// Set all the track sector statuses to the information screen
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
    if (message.SubCategory == "TrackSurfaceSlippery") {
        let sectorNumber = +message.Message.match(/\d+/)[0];
        let flag = "CLEAR";
        let trackSector = document.querySelector(`#trackSector${sectorNumber}`);
        trackSector.innerHTML = "SLIPPERY";
        trackSector.className = "slippery";
    }
}

// Setting the grip status to the information screen
function setGrip(message) {
    if (message.SubCategory == "LowGripConditions") {
        grip = "LOW";
        color = "orange";
    }

    if (message.SubCategory == "NormalGripConditions") {
        grip = "NORMAL";
        color = "green";
    }
    gripConditions.innerHTML = grip;
    gripConditions.className = color;
}

// Setting the progress of the current session including custom progress per session
function setProgress() {
    // General information
    let color = "gray";
    // let timer = "00:15:00";
    let sessionDuration;
    let currentSessionPercentage;
    let maxSessionPercentage;
    let timerSeconds =
        +timer.split(":")[0] * 60 * 60 +
        +timer.split(":")[1] * 60 +
        +timer.split(":")[2];
    let totalTimerSeconds =
        +timer.split(":")[0] * 60 * 60 +
        +timer.split(":")[1] * 60 +
        +timer.split(":")[2];
    sessionDuration = new Date(
        new Date(sessionInfo.EndDate).getTime() -
            new Date(sessionInfo.StartDate).getTime()
    ).toLocaleTimeString("en-GB", {
        timeZone: "UTC",
    });
    let sessionDurationSeconds =
        +sessionDuration.split(":")[0] * 60 * 60 +
        +sessionDuration.split(":")[1] * 60 +
        +sessionDuration.split(":")[2];
    if (debug) {
        console.log("Session type: " + sessionInfo.Type);
    }
    if (sessionInfo.Type == "Race") {
        // If the session is a race
        let currentLap = laps.CurrentLap;
        let totalLaps = laps.TotalLaps;
        let bestLapP1;
        for (i in timingData.Lines) {
            if (debug) {
                console.log(timingData.Lines[i].Position);
            }
            if (timingData.Lines[i].Position == "1") {
                if (debug) {
                    console.log(timingData.Lines[i].BestLapTime.Value);
                }
                if (timingData.Lines[i].BestLapTime.Value === "") {
                    bestLapP1 = "00:01";
                } else {
                    bestLapP1 = timingData.Lines[i].BestLapTime.Value;
                }
            }
        }
        let bestLapMinutes = +bestLapP1.split(":")[0];
        let bestLapSeconds = +bestLapP1.split(":")[1] + bestLapMinutes * 60;
        let lapsRemaining = totalLaps - currentLap;
        let maxLaps = timerSeconds / bestLapSeconds;
        if (debug) {
            console.log(bestLapP1);
            console.log(bestLapSeconds);
            console.log("Timer seconds: " + timerSeconds);
            console.log("Last lap seconds: " + bestLapSeconds);
            console.log("Maximal laps: " + maxLaps);
            console.log("Laps Remaining: " + lapsRemaining);
        }
        if (maxLaps > lapsRemaining) {
            if (sessionStartStatus.Status == "Inactive") {
                currentLap = 0;
                color = "gray";
                currentSessionPercentage = "0%";
            } else {
                color = "green";
                currentSessionPercentage =
                    Math.round(
                        ((currentLap - 1 - totalLaps) / totalLaps) * 100 + 100
                    ) + "%";
            }

            maxSessionPercentage = "100%";
            let lapCounter = "Lap: " + currentLap + "/" + totalLaps;
            lapCount.className = color;
            lapCount.innerHTML = lapCounter;
            if (currentSessionPercentage == "100%" && currentLap != totalLaps) {
                currentSessionPercentage = "99%";
            }
            if (sessionStartStatus.Status == "Finished") {
                currentProgress.innerHTML = "COMPLETED";
                currentProgress.className = "gray";
                return;
            }
        } else {
            let totalMaxLaps = maxLaps + currentLap;
            currentSessionPercentage =
                Math.round(((currentLap - totalLaps) / totalLaps) * 100 + 100) +
                "%";
            maxSessionPercentage =
                Math.round(
                    ((totalMaxLaps - totalLaps) / totalLaps) * 100 + 100
                ) + "%";
            if (maxSessionPercentage >= "75%") {
                color = "orange";
            } else {
                color = "red";
            }
            if (currentSessionPercentage == "0%") {
                color = "gray";
            }
            let lapCounter =
                "Lap: " + currentLap + "/" + (Math.floor(totalMaxLaps) + 1);
            lapCount.className = color;
            lapCount.innerHTML = lapCounter;
            if (debug) {
                console.log("Session: " + currentSessionPercentage);
                console.log("Session max: " + maxSessionPercentage);
                console.log("Timerseconds: " + timerSeconds);
                console.log("Current lap: " + currentLap);
                console.log("Max lap: " + maxLaps);
            }
            if (
                currentSessionPercentage == maxSessionPercentage &&
                (timerSeconds != "0" || currentLap != maxLaps)
            ) {
                currentSessionPercentage =
                    +currentSessionPercentage.slice(0, -1) - 1 + "%";
            }
            if (
                currentSessionPercentage == maxSessionPercentage &&
                timerSeconds == "0" &&
                currentLap == maxLaps
            ) {
                currentProgress.innerHTML = "COMPLETED";
                currentProgress.className = "gray";
                return;
            }
        }
    } else if (sessionInfo.Type == "Qualifying") {
        // If the session is qualifying
        switch (
            sessionData.Series[sessionData.Series.length - 1].QualifyingPart
        ) {
            case 1:
                sessionDurationSeconds = 1080;
            case 2:
                sessionDurationSeconds = 900;
            case 3:
                sessionDurationSeconds = 720;
        }
        currentSessionPercentage =
            Math.round(
                100 -
                    ((totalTimerSeconds - sessionDurationSeconds) /
                        sessionDurationSeconds) *
                        100 -
                    100
            ) + "%";
        let Q;
        for (i in sessionData.Series) {
            if (debug) {
                console.log(sessionData.Series[i]);
            }
            Q = "Q" + sessionData.Series[i].QualifyingPart;
        }
        if (debug) {
            console.log("Qualifying");
            console.log(currentSessionPercentage);
            console.log(totalTimerSeconds);
            console.log(sessionDurationSeconds);
            console.log(Q);
        }
        if (currentSessionPercentage == "0%") {
            color = "gray";
        }
        let maxQ = "Q3";
        maxSessionPercentage = "100%";
        if (Q == maxQ) {
            totalQProgressElement.innerHTML = Q + " - " + maxQ;
            totalQProgressElement.className = "gray";
        } else {
            totalQProgressElement.className = "green";
        }
        totalQProgressElement.innerHTML = Q + " - " + maxQ;

        if (currentSessionPercentage == "100%" && totalTimerSeconds != "0") {
            currentSessionPercentage = "99%";
        }
        if (currentSessionPercentage == "100%" && totalTimerSeconds == "0") {
            currentProgress.innerHTML = "COMPLETED";
            currentProgress.className = "gray";
            return;
        }
    } else {
        // If the session is a practice session
        if (debug) {
            console.log(sessionDuration);
        }
        maxSessionPercentage = "100%";
        currentSessionPercentage =
            Math.round(
                100 -
                    ((timerSeconds - sessionDurationSeconds) /
                        sessionDurationSeconds) *
                        100 -
                    100
            ) + "%";
        if (currentSessionPercentage == "0%") {
            color = "gray";
        }
        if (currentSessionPercentage == "100%" && timerSeconds != "0") {
            currentSessionPercentage = "99%";
        }
        if (currentSessionPercentage == "100%" && timerSeconds == "0") {
            currentProgress.innerHTML = "COMPLETED";
            currentProgress.className = "gray";
            return;
        }
    }
    if (debug) {
        console.log(color);
    }
    currentProgress.innerHTML =
        currentSessionPercentage + " - " + maxSessionPercentage;
    currentProgress.className = color;
}

// Setting the timers for the current session
function setTrackTime() {
    let systemTime = clockData.systemTime;
    let trackTime = clockData.trackTime;
    let now = Date.now();
    let trackTimeLiveMs = (now -= systemTime -= trackTime);
    let offsetMs =
        (+sessionInfo.GmtOffset.split(":")[0] * 60 * 60 +
            +sessionInfo.GmtOffset.split(":")[1] * 60 +
            +sessionInfo.GmtOffset.split(":")[2]) *
        1000;
    let trackTimeLive = new Date(trackTimeLiveMs + offsetMs).toLocaleTimeString(
        "en-GB",
        {
            timeZone: "UTC",
        }
    );

    if (debug) {
        console.log("Now: " + now);
        console.log("UTC Offset: " + sessionInfo.GmtOffset);
        console.log("UTC Offset ms: " + offsetMs);
        console.log(systemTime);
        console.log(trackTime);
        console.log(trackTimeLiveMs);
        console.log(trackTimeLive);
    }
    trackTimeElement.innerHTML = trackTimeLive;
    trackTimeElement.className = "green";
}

// Get the history of aborts
function getOldAborts() {
    let statusSeriesIndexes = [];
    let usedTime;
    for (i in sessionData.StatusSeries) {
        if (
            sessionData.StatusSeries[i].SessionStatus != undefined &&
            (sessionData.StatusSeries[i].SessionStatus == "Started" ||
                sessionData.StatusSeries[i].SessionStatus == "Aborted")
        ) {
            if (debug) {
                console.log(sessionData.StatusSeries[i].SessionStatus);
                console.log(i);
            }
            statusSeriesIndexes.push(i);
        }
    }
    for (i in statusSeriesIndexes) {
        if (debug) {
            console.log(statusSeriesIndexes[i]);
        }
        if (
            sessionData.StatusSeries[statusSeriesIndexes[i]].SessionStatus ==
            "Aborted"
        ) {
            if (debug) {
                console.log(
                    sessionData.StatusSeries[statusSeriesIndexes[i]].Utc
                );
            }
            let startAbort =
                sessionData.StatusSeries[statusSeriesIndexes[i]].Utc;
            let endAbort;
            if (
                sessionData.StatusSeries[statusSeriesIndexes[+i + 1]] !=
                undefined
            ) {
                endAbort =
                    sessionData.StatusSeries[statusSeriesIndexes[+i + 1]].Utc;
            }
            if (startAbort != undefined && endAbort != undefined) {
                usedTime =
                    new Date(endAbort).getTime() -
                    new Date(startAbort).getTime();
                fullTimerRemaining -= usedTime;
                fullSessionTimer = new Date(
                    fullTimerRemaining
                ).toLocaleTimeString("en-GB", {
                    timeZone: "UTC",
                });
            }
            if (debug) {
                console.log("Start Abort: " + startAbort);
                console.log("End Abort: " + endAbort);
                console.log("Old remaining time: ");
                console.log(fullTimerRemaining);
                console.log("Used time ms: ");
                console.log(usedTime);
                console.log("Remaining time: " + fullTimerRemaining);
                console.log(
                    "Remaining timer: " +
                        new Date(fullTimerRemaining).toLocaleTimeString(
                            "en-GB",
                            {
                                timeZone: "UTC",
                            }
                        )
                );
            }
        }
    }
}

function setTimers() {
    let color = "gray";
    let fullColor = "gray";
    let sessionDuration;
    if (debug) {
        console.log(fullSessionTimer);
        console.log(fullTimerRemaining);
    }
    if (extraPolatedClock.Extrapolating) {
        color = "green";
        sessionDuration = new Date(
            (+extraPolatedClock.Remaining.split(":")[0] * 60 * 60 +
                +extraPolatedClock.Remaining.split(":")[1] * 60 +
                +extraPolatedClock.Remaining.split(":")[2]) *
                1000 +
                1000
        );
        let test = new Date().toLocaleTimeString("en-GB", {
            timeZone: "UTC",
        });
        let trackTime = clockData.trackTime;
        let systemTime = clockData.systemTime;
        let timerStart = new Date(extraPolatedClock.Utc).getTime();
        let now = Date.now();
        timer = new Date(
            sessionDuration - ((now -= systemTime -= trackTime) - timerStart)
        ).toLocaleTimeString("en-GB", {
            timeZone: "UTC",
        });

        // .toLocaleTimeString("en-GB", { timeZone: "UTC" });
        if (debug) {
            console.log(extraPolatedClock.Utc);
            console.log(extraPolatedClock.Extrapolating);
            // console.log(Remaining);
            console.log(test);
            console.log(sessionDuration);
            console.log(systemTime);
            console.log(timerStart);
            console.log(timer);
        }
    } else {
        timer = extraPolatedClock.Remaining;
        if (timer != "02:00:00") {
            fullColor = "yellow";
            let trackTime = clockData.trackTime;
            let systemTime = clockData.systemTime;
            let timerStart = new Date(extraPolatedClock.Utc).getTime();
            let now = Date.now();
            fullSessionTimer = new Date(
                fullTimerRemaining -
                    ((now -= systemTime -= trackTime) - timerStart)
            ).toLocaleTimeString("en-GB", {
                timeZone: "UTC",
            });
            if (debug) {
                console.log((now -= systemTime -= trackTime) - timerStart);
                console.log(fullSessionTimer);
                console.log(fullTimerRemaining);
            }
        }

        if (fullTimerRemaining < 0) {
            fullSessionTimer = "00:00:00";
        }
        if (timer == "00:00:00") {
            color = "gray";
        }
    }
    if (sessionInfo.Type == "Race") {
        sessionTimerElement.innerHTML = timer;
        fullSessionTimerElement.innerHTML = fullSessionTimer;
        sessionTimerElement.className = color;
        fullSessionTimerElement.className = fullColor;
    } else {
        sessionTimerElement.innerHTML = timer;
        sessionTimerElement.className = color;
    }
}

// Adding the DRS zones
function addDrsZones() {}

// Running all the functions
let count = 0;
async function run() {
    apiRequests();
    getMainHTML();
    addTrackSectors();
    getOldAborts();
    while (true) {
        apiRequests();
        setSession();
        forRaceControlMessages();
        setDRS();
        setTimers();
        setTrackTime();
        setTrackStatus();
        setProgress();
        if (debug) {
            console.log(count++);
        }
        await sleep(250);
    }
}

// Running all the funtions that sessionData.StatusSeries[i].Utc a for (i in RCMs.Messages) loop
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
            setGrip(message);
        }
    }
}

// Running the whole screen
run();
