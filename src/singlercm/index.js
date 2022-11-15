const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// URL output function
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
        document.getElementById("RCM").classList.remove("drag");
        transparent = false;
    } else {
        document.getElementById("background").className = "transparent";
        document.getElementById("RCM").classList.add("drag");
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

const bar = document.getElementById("RCM");
const text = document.getElementById("message");
const icon = document.getElementById("icon");

WANTED_CATEGORIES = [
    "Flag",
    "IncidentNoted",
    "IncidentUnderInvestigation",
    "IncidentNoFurtherInvestigation",
    "IncidentNoFurtherAction",
    "LapTimeDeleted",
    "OffTrackAndContinued",
    "SpunAndContinued",
    "MissedApex",
    "CarStopped",
    "LowGripConditions",
    "TimePenalty",
    "StopGoPenalty",
    "TrackTestCompleted",
    "TrackSurfaceSlippery",
    "SessionResume",
    "SessionStartDelayed",
    "SessionDurationChanged",
    "Correction",
    "Weather",
    "PitEntry",
    "PitExit",
    "NormalGripConditions",
    "SafetyCar",
    "Drs",
    "LappedCarsMayOvertake",
    "LappedCarsMayNotOvertake",
    "IncidentInvestigationAfterSession",
    "Other",
];

WANTED_FLAGS = ["BLACK AND ORANGE", "BLACK AND WHITE", "CHEQUERED"];

WANTED_SAFETYCAR = [
    "SAFETY CAR WILL USE START/FINISH STRAIGHT",
    "SAFETY CAR THROUGH THE PIT LANE",
];

let rcms;
let lastRCM;
let lastRCMstring;
let oldRCM;
let lastMessage;
let category;
let queue = [];
let running = false;

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

async function getLastRCM() {
    rcms = JSON.parse(
        httpGet(`http://${host}:${port}/api/v1/live-timing/RaceControlMessages`)
    );
    lastRCM = rcms.Messages[rcms.Messages.length - 1];
    if (newMessage(lastRCM)) {
        if (await filterCategories(lastRCM)) {
            await addToQueue();
            return;
        }
        return;
    }
    return;
}

async function run() {
    while (true) {
        await getConfigurations();
        getLastRCM();
        showLastMessage();
        await sleep(1000);
    }
}

run();

function addToQueue() {
    queue.push(JSON.stringify(lastRCM));
}

function newMessage(lastRCM) {
    lastRCMstring = JSON.stringify(lastRCM);
    if (
        queue.includes(JSON.stringify(lastRCM)) ||
        JSON.stringify(oldRCM) == JSON.stringify(lastRCM)
    ) {
        return false;
    }
    oldRCM = lastRCM;
    return true;
}

async function showLastMessage() {
    console.log(queue);
    if (queue != "" && running == false) {
        running = true;
        lastRCM = JSON.parse(queue[0]);
        let message = JSON.parse(queue[0]).Message;
        let image = getImage();
        icon.src = "images/icons/" + image;
        text.innerHTML = message;
        bar.className = "shown";
        queue.pop();
        await sleep(10000);
        bar.className = "hidden";
        await sleep(2000);
        running = false;
    }
}

async function filterCategories(lastRC) {
    category = lastRC.SubCategory;
    if (category == undefined) {
        category = lastRC.OriginalCategory;
    }
    console.log(category);
    if (WANTED_CATEGORIES.includes(category)) {
        if (category == "Flag") {
            if (WANTED_FLAGS.includes(lastRCM.Flag)) {
                return true;
            }
            return false;
        }
        if (category == "SafetyCar") {
            for (i in WANTED_SAFETYCAR) {
                if (WANTED_SAFETYCAR[i] == lastRC.Message) {
                    return true;
                } else return false;
            }
        }
        return true;
    }
    return false;
}

function getImage() {
    switch (WANTED_CATEGORIES.indexOf(category)) {
        case 0:
            if (lastRCM.Flag == "BLACK AND ORANGE") {
                return "flag_blackandorange.png";
            }
            if (lastRCM.Flag == "BLACK AND WHITE") {
                return "flag_blackandwhite.png";
            }
            if (lastRCM.Flag == "CHEQUERED") {
                return "flag_chequered.png";
            }
        case 1:
            return "incident_noted.png";
        case 2:
            return "incident_underinvestigation.png";
        case 3:
            return "incident_nofurther_investigation.png";
        case 4:
            return "Incident_nofurther_action.png";
        case 5:
            return "car_tracklimits.png";
        case 6:
            return "car_offtrack.png";
        case 7:
            return "car_spun.png";
        case 8:
            return "car_missedapex.png";
        case 9:
            return "car_stopped.png";
        case 10:
            return "grip_low.png";
        case 11:
            return "penalty_time.png";
        case 12:
            return "penalty_stopandgo.png";
        case 14:
            return "grip_slippery.png";
        case 15:
            return "session_resume.png";
        case 16:
            return "session_startdelayed.png";
        case 17:
            return "session_durationchanged.png";
        case 18:
            return "correction.png";
        case 19:
            return "weather.png";
        case 20:
            if (lastRCM.Flag == "OPEN") {
                return "pit_entry_open.png";
            }
            if (lastRCM.Flag == "CLOSED") {
                return "pit_entry_closed.png";
            }
        case 21:
            if (lastRCM.Flag == "OPEN") {
                return "pit_exit_open.png";
            }
            if (lastRCM.Flag == "CLOSED") {
                return "pit_exit_closed.png";
            }
        case 22:
            return "grip_normal.png";
        case 23:
            if (lastRCM.Message == "SAFETY CAR THROUGH THE PIT LANE") {
                return "safetycar_pitlane.png";
            }
            if (
                lastRCM.Message == "SAFETY CAR WILL USE START/FINISH STRAIGHT"
            ) {
                return "safetycar_startfinish.png";
            }
        case 24:
            console.log(lastRCM.Flag);
            if (lastRCM.Flag == "ENABLED") {
                return "drs_enabled.png";
            }
            if (lastRCM.Flag == "DISABLED") {
                return "drs_disabled.png";
            }
        case 25:
            return "lappedcars_overtake.png";
        case 26:
            return "lappedcars_notovertake.png";
        case 27:
            return "incident_investigationafterthesession.png";
        default:
            return "blank.png";
    }
}
