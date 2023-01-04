const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let crashCount = 0;
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };

    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "DriverList",
        "CarData",
        "TimingData",
        "SessionStatus",
        "SessionInfo",
        "TrackStatus",
        "LapCount",
    ]);
    driverList = liveTimingState.DriverList;
    carData = liveTimingState.CarData.Entries;
    timingData = liveTimingState.TimingData.Lines;
    sessionStatus = liveTimingState.SessionStatus.Status;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    trackStatus = liveTimingState.TrackStatus;
    if (sessionType === "Race") {
        lapCount = liveTimingState.LapCount;
    }
}

let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "";
        transparent = false;
    } else {
        document.querySelector("body").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        toggleBackground();
    }
});

function getSpeedThreshold() {
    if (
        sessionType === "Qualifying" ||
        sessionType === "Practice" ||
        sessionStatus === "Inactive" ||
        sessionStatus === "Aborted" ||
        trackStatus.Status === "4" ||
        trackStatus.Status === "6" ||
        trackStatus.Status === "7"
    ) {
        return 10;
    }
    return 30;
}

function overwriteCrashedStatus(racingNumber) {
    const driverTimingData = timingData[racingNumber];

    if (driverTimingData.InPit === true) return true;
    if (driverTimingData.Retired === true) return true;
    if (driverTimingData.Stopped === true) return true;

    const lastSectorSegments = driverTimingData.Sectors.slice(-1)[0].Segments;

    const sessionInactive = sessionStatus === "Inactive" || sessionStatus === "Finished";

    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (lastSectorSegments.slice(-2, -1)[0].Status !== 0 && sessionInactive && !timingData[racingNumber].PitOut) {
        console.log(racingNumber + " is lining up for a race start");
        return true;
    }

    // If the race is started and the last mini sector has a different value then 0 (has a value)
    if (
        sessionType === "Race" &&
        sessionStatus === "Started" &&
        lastSectorSegments.slice(-1)[0].Status !== 0 &&
        lapCount.CurrentLap === 1
    ) {
        console.log(racingNumber + " is doing a race start");
        return true;
    }

    // Detect if practice pitstop
    // If the session is 'practice' and the second mini sector does have a value.
    if (sessionType === "Practice" && driverTimingData.PitOut) {
        console.log(racingNumber + " is doing a practice start");
        return true;
    }

    // Detect if car is in parc ferme
    // If the car has stopped anywhere in the final sector and the 'race' has 'finished'
    if (
        sessionType === "Race" &&
        sessionStatus === "Finished" &&
        lastSectorSegments.some((segment) => segment.Status !== 0)
    ) {
        console.log(racingNumber + " is in parc ferme");
        return true;
    }

    return false;
}

function weirdCarBehaviour(driverCarData, racingNumber) {
    const driverTimingData = timingData[racingNumber];

    const rpm = driverCarData[0];

    const speed = driverCarData[2];

    const gear = driverCarData[3];

    const speedLimit = getSpeedThreshold();

    return (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear ===
            (sessionStatus === "Inactive" ||
            sessionStatus === "Aborted" ||
            (sessionType !== "Race" && driverTimingData.PitOut)
                ? ""
                : 0)
    );
}

function getCarData(driverNumber) {
    try {
        carData[0].Cars[driverNumber].Channels;
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[driverNumber].Channels;
}

function driverHasCrashed(driverNumber) {
    const driverCarData = getCarData(driverNumber);

    if (!weirdCarBehaviour(driverCarData, driverNumber)) return false;

    if (overwriteCrashedStatus(driverNumber)) return false;

    return true;
}

async function run() {
    await getConfigurations();
    while (true) {
        await apiRequests();

        for (const i in driverList) {
            const driverInfo = driverList[i];

            const driverNumber = driverInfo.RacingNumber;

            const name = `${driverInfo.FirstName} ${driverInfo.LastName.toUpperCase()}`;

            const color = driverInfo.TeamColour;

            const driverCarData = getCarData(driverNumber);

            if (driverCarData !== "error") {
                const HTMLDisplayList = document.getElementById("list");

                const driverElement = document.getElementById(driverNumber);

                const crashed = driverHasCrashed(driverNumber);

                if (crashed) {
                    if (driverElement === null) {
                        const newDriverElement = document.createElement("li");
                        newDriverElement.id = driverNumber;
                        newDriverElement.style.color = "#" + color;
                        newDriverElement.innerHTML = name;
                        HTMLDisplayList.appendChild(newDriverElement);
                        await sleep(10);
                        newDriverElement.className = "show";
                    }

                    console.log(name + " has crashed");
                } else {
                    if (driverElement !== null) {
                        document.getElementById(driverNumber).className = "";

                        await sleep(400);

                        driverElement.remove();
                    }
                }
            }
        }

        await sleep(250);

        const HTMLDisplayListLength = document.getElementById("list").childNodes.length;

        if (HTMLDisplayListLength > crashCount) triggerWarning();
        crashCount = HTMLDisplayListLength;
    }
}
run();

async function triggerWarning() {
    console.log("trigger warning");
    const title = document.querySelector("h1");
    let loop = 0;
    while (loop <= 10) {
        await sleep(200);

        title.className = "warning";

        await sleep(200);

        title.className = "";

        loop++;
    }
}
