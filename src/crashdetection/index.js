const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let api;
let driverList;
let carData;
let timingData;
let sessionStatus;
let lapCount;
let trackStatus;
let warning;
let crashCount = 0;

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
async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query LiveTimingState {
      liveTimingState {
        TimingData
        SessionStatus
        SessionInfo
        LapCount
        CarData
        DriverList
        TrackStatus
      }
    }`,
                    operationName: "LiveTimingState",
                }),
                method: "POST",
            })
        ).json()
    ).data.liveTimingState;
    driverList = api.DriverList;
    carData = api.CarData;
    timingData = api.TimingData;
    sessionStatus = api.SessionStatus.Status;
    sessionInfo = api.SessionInfo;
    trackStatus = api.TrackStatus;
    if (sessionInfo.Type == "Race") {
        lapCount = api.LapCount;
    }
    if (debug) {
        console.log("------------------------------");
        console.log("Driver list:");
        console.log(driverList);
        console.log("Car data:");
        console.log(carData);
    }
}

function getDriverName(number) {
    if (debug) {
        console.log("------------------------------");
        console.log(
            "Driver name: " +
                driverList[number].FirstName +
                " " +
                driverList[number].LastName.toUpperCase()
        );
    }
    return (
        driverList[number].FirstName +
        " " +
        driverList[number].LastName.toUpperCase()
    );
}

function getTeamColor(number) {
    if (debug) {
        console.log("------------------------------");
        console.log("Team color hex: " + driverList[number].TeamColour);
    }
    return driverList[number].TeamColour;
}

function getCarData(number) {
    try {
        carData.Entries[0].Cars[number].Channels;
        if (debug) {
            console.log("------------------------------");
            console.log(carData.Entries[0].Cars[number].Channels);
        }
    } catch (error) {
        return "error";
    }
    return carData.Entries[0].Cars[number].Channels;
}

function getSpeedLimit() {
    if (
        sessionInfo.Type == "Qualifying" ||
        sessionInfo.Type == "Practice" ||
        sessionStatus == "Inactive" ||
        sessionStatus == "Aborted" ||
        trackStatus.Status == "4" ||
        trackStatus.Status == "6" ||
        trackStatus.Status == "7"
    ) {
        return 10;
    }
    return 30;
}

function otherInfluence(racingNumber) {
    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (
        timingData.Lines[racingNumber].Sectors[
            +timingData.Lines[racingNumber].Sectors.length - 1
        ].Segments[
            +timingData.Lines[racingNumber].Sectors[
                +timingData.Lines[racingNumber].Sectors.length - 1
            ].Segments.length - 2
        ].Status != 0 &&
        (sessionStatus == "Inactive" || sessionStatus == "Finished") &&
        !timingData.Lines[racingNumber].PitOut
    ) {
        console.log(racingNumber + " is lining up on the grid");
        return true;
    }
    // If the race is started and the last mini sector has a different value then 0 (has a value)
    if (
        sessionInfo.Type == "Race" &&
        sessionStatus == "Started" &&
        timingData.Lines[racingNumber].Sectors[
            +timingData.Lines[racingNumber].Sectors.length - 1
        ].Segments[
            +timingData.Lines[racingNumber].Sectors[
                +timingData.Lines[racingNumber].Sectors.length - 1
            ].Segments.length - 3
        ].Status != 0 &&
        lapCount.CurrentLap == 1
    ) {
        console.log(racingNumber + " is doing a race start");
        return true;
    }
    // Detect if practice pitstop
    // If the session is 'practice' and the second mini sector does have a value.
    if (debug) {
        console.log(sessionInfo.Type == "Practice");
        console.log(timingData.Lines[racingNumber].PitOut);
        console.log(
            timingData.Lines[racingNumber].Sectors[0].Segments[1].Status == 0
        );
    }
    if (
        sessionInfo.Type == "Practice" &&
        timingData.Lines[racingNumber].PitOut
    ) {
        console.log(racingNumber + " is doing a practice start");
        return true;
    }
    if (
        sessionInfo.Type == "Race" &&
        sessionStatus == "Finished" &&
        timingData.Lines[racingNumber].Sectors[
            +timingData.Lines[racingNumber].Sectors.length - 2
        ].Segments[
            +timingData.Lines[racingNumber].Sectors[
                +timingData.Lines[racingNumber].Sectors.length - 2
            ].Segments.length - 1
        ].Status != 0
    ) {
        console.log(racingNumber + " is in parc ferme");
        return false;
    }
    return false;
}

function neutralFilter(number) {
    if (
        sessionStatus == "Inactive" ||
        sessionStatus == "Aborted" ||
        (sessionInfo.Type != "Race" && timingData.Lines[number].PitOut)
    ) {
        return "";
    }
    return 0;
}

function getCarStatus(data, racingNumber) {
    let rpm = data[0];
    let speed = data[2];
    let gear = data[3];
    let speedLimit = getSpeedLimit();
    if (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear === neutralFilter(racingNumber)
    ) {
        return true;
    } else {
        return false;
    }
}
let list = document.getElementById("list");

let count = 0;
async function run() {
    while (true) {
        if (debug) {
            console.log("------------------------------");
        }
        await getConfigurations();
        await apiRequests();
        for (i in driverList) {
            if (debug) {
                console.log(i);
                console.log(driverList[i]);
            }
            if (!isNaN(+i)) {
                let number = driverList[i].RacingNumber;
                let name = getDriverName(number);
                let color = getTeamColor(number);
                let data = getCarData(number);
                if (data !== "error") {
                    let crashed = getCarStatus(data, number);
                    let driverElement = document.getElementById(number);
                    if (crashed) {
                        let driverData = timingData.Lines[number];
                        if (
                            driverData.InPit === true ||
                            driverData.Retired === true ||
                            driverData.Stopped === true ||
                            otherInfluence(number)
                        ) {
                            crashed = false;
                        }
                    }
                    if (crashed) {
                        if (driverElement == null) {
                            let newElement = document.createElement("li");
                            newElement.id = number;
                            newElement.style.color = "#" + color;
                            newElement.innerHTML = name;
                            list.appendChild(newElement);
                            await sleep(10);
                            newElement.className = "show";
                        }

                        if (debug) {
                            console.log(name + " has crashed");
                        }
                    } else {
                        if (driverElement == null) {
                        } else {
                            document.getElementById(number).className = "";
                            await sleep(400);
                            driverElement.remove();
                        }
                    }
                }
            } else {
                if (debug) {
                    console.log("NaN");
                }
            }
        }

        await sleep(250);
        if (debug) {
            console.log(count++);
            console.log(document.getElementById("list").childNodes.length);
        }
        if (document.getElementById("list").childNodes.length > crashCount) {
            crashCount = document.getElementById("list").childNodes.length;
            triggerWarning();
            console.log("New crash");
        } else {
            crashCount = document.getElementById("list").childNodes.length;
        }
    }
}
run();

async function triggerWarning() {
    console.log("trigger warning");
    let title = document.querySelector("h1");
    console.log(title);
    let loop = 0;
    while (loop <= 10) {
        await sleep(200);
        title.className = "warning";
        await sleep(200);
        title.className = "";
        loop++;
        console.log("loop");
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
    if (event.key == "Escape") {
        toggleBackground();
    }
});
