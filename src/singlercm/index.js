const { ipcRenderer } = require("electron");

const debug = false;

const f1mvApi = require("npm_f1mv_api");

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

WANTED_SAFETYCAR = ["SAFETY CAR WILL USE START/FINISH STRAIGHT", "SAFETY CAR THROUGH THE PIT LANE"];

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_store")).config;
    const host = configFile.network.host;
    const port = (await f1mvApi.discoverF1MVInstances(host)).port;

    displayLength = parseInt(configFile.singlercm?.display_duration) ?? 10000;

    config = {
        host: host,
        port: port,
    };
}

let queue = [];
let oldRaceControlMessages = [];
async function getRaceControlMessages() {
    const raceControlMessages = (await f1mvApi.LiveTimingAPIGraphQL(config, "RaceControlMessages")).RaceControlMessages
        .Messages;
    for (const message of raceControlMessages) {
        const stringMessage = JSON.stringify(message);
        if (!oldRaceControlMessages.includes(stringMessage)) {
            oldRaceControlMessages.push(stringMessage);
            console.log(message);
            queue.push(stringMessage);
        }
    }
}

async function runQueue(count) {
    if (count === 0) queue = [];
    for (const message of queue) {
        const jsonMessage = JSON.parse(message);
        if (isMessageWanted(jsonMessage)) await showMessage(jsonMessage);
    }
    queue = [];
}

async function run() {
    await getConfigurations();
    let count = 0;
    while (true) {
        await getRaceControlMessages();
        await runQueue(count);
        await sleep(1000);
        count++;
    }
}
run();

async function showMessage(raceControlMessage) {
    console.log("Showing message");
    const category = raceControlMessage.SubCategory ? raceControlMessage.SubCategory : raceControlMessage.Category;
    const message = await (async () => {
        let formattedMessage = raceControlMessage.Message;

        const messageArray = formattedMessage.split(" ");

        console.log(formattedMessage);

        formattedMessage = formattedMessage.replace("DELETED", '<span class="red">DELETED</span>');
        formattedMessage = formattedMessage.replace("PENALTY", '<span class="red">PENALTY</span>');
        formattedMessage = formattedMessage.replace("WARNING", '<span class="orange">WARNING</span>');
        formattedMessage = formattedMessage.replace("INCIDENT", '<span class="orange">INCIDENT</span>');

        formattedMessage = formattedMessage.replace("OPEN", '<span class="green">OPEN</span>');
        formattedMessage = formattedMessage.replace("CLOSED", '<span class="red">CLOSED</span>');

        formattedMessage = formattedMessage.replace("ENABLED", '<span class="green">ENABLED</span>');
        formattedMessage = formattedMessage.replace("DISABLED", '<span class="red">DISABLED</span>');

        const driverList = (await f1mvApi.LiveTimingAPIGraphQL(config, "DriverList")).DriverList;
        for (const driver in driverList) {
            const driverTla = driverList[driver].Tla;
            if (formattedMessage.includes(`(${driverTla})`)) {
                const messageDriverIndex = messageArray.indexOf(`(${driverTla})`);
                const driverNumber = messageArray[messageDriverIndex - 1];

                formattedMessage = formattedMessage.replace(
                    `${driverNumber} (${driverTla})`,
                    `<span style="color: #${driverList[driverNumber].TeamColour}">${driverNumber} (${driverTla})</span>`
                );

                console.log(formattedMessage);
            }
        }

        return formattedMessage;
    })();

    const bar = document.getElementById("RCM");
    const text = document.getElementById("message");
    const icon = document.getElementById("icon");

    const image = getImage(raceControlMessage, category);
    const path = "../icons/" + image;

    icon.src = path;
    text.innerHTML = message;

    bar.className = "shown";

    await sleep(displayLength);

    bar.className = "hidden";

    await sleep(2000);
}

function isMessageWanted(message) {
    const category = message.SubCategory ? message.SubCategory : message.Category;

    console.log(category);

    if (WANTED_CATEGORIES.includes(category)) {
        switch (category) {
            case "Flag":
                return WANTED_FLAGS.includes(message.Flag);
            case "SafetyCar":
                return WANTED_SAFETYCAR.includes(message.Message);
            default:
                return true;
        }
    }
    return false;
}

function getImage(message, category) {
    switch (WANTED_CATEGORIES.indexOf(category)) {
        case 0:
            if (message.Flag === "BLACK AND ORANGE") {
                return "flags/flag_blackandorange.png";
            }
            if (message.Flag === "BLACK AND WHITE") {
                return "flags/flag_blackandwhite.png";
            }
            if (message.Flag === "CHEQUERED") {
                return "flags/flag_chequered.png";
            }
        case 1:
            return "messages/incident_noted.png";
        case 2:
            return "messages/incident_underinvestigation.png";
        case 3:
            return "messages/incident_nofurther_investigation.png";
        case 4:
            return "messages/Incident_nofurther_action.png";
        case 5:
            return "messages/car_tracklimits.png";
        case 6:
            return "messages/car_offtrack.png";
        case 7:
            return "messages/car_spun.png";
        case 8:
            return "messages/car_missedapex.png";
        case 9:
            return "messages/car_stopped.png";
        case 10:
            return "messages/grip_low.png";
        case 11:
            return "messages/penalty_time.png";
        case 12:
            return "messages/penalty_stopandgo.png";
        case 14:
            return "messages/grip_slippery.png";
        case 15:
            return "messages/session_resume.png";
        case 16:
            return "messages/session_startdelayed.png";
        case 17:
            return "messages/session_durationchanged.png";
        case 18:
            return "messages/correction.png";
        case 19:
            return "messages/weather.png";
        case 20:
            if (message.Flag === "OPEN") return "messages/pit_entry_open.png";
            if (message.Flag === "CLOSED") return "messages/pit_entry_closed.png";
        case 21:
            if (message.Flag === "OPEN") return "messages/pit_exit_open.png";
            if (message.Flag === "CLOSED") return "messages/pit_exit_closed.png";
        case 22:
            return "messages/grip_normal.png";
        case 23:
            if (message.Message === "SAFETY CAR THROUGH THE PIT LANE") return "messages/safetycar_pitlane.png";
            if (message.Message === "SAFETY CAR WILL USE START/FINISH STRAIGHT")
                return "messages/safetycar_startfinish.png";
        case 24:
            if (message.Flag == "ENABLED") return "messages/drs_enabled.png";
            if (message.Flag == "DISABLED") return "messages/drs_disabled.png";
        case 25:
            return "messages/lappedcars_overtake.png";
        case 26:
            return "messages/lappedcars_notovertake.png";
        case 27:
            return "messages/incident_investigationafterthesession.png";
        default:
            return "blank.png";
    }
}
