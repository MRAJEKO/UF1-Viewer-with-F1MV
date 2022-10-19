const debug = true;

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

let api;
let driverList;
let carData;
let timingData;
let sessionStatus;
let warning;
let crashCount = 0;

function apiRequests() {
    api = JSON.parse(
        httpGet(
            "http://localhost:10101/api/v2/live-timing/state/DriverList,CarData,TimingData,SessionStatus"
        )
    );
    driverList = api.DriverList;
    carData = api.CarData;
    timingData = api.TimingData;
    sessionStatus = api.SessionStatus;
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
    if (debug) {
        console.log("------------------------------");
        console.log(carData.Entries[0].Cars[number].Channels);
    }
    return carData.Entries[0].Cars[number].Channels;
}

function getCarStatus(data) {
    let rpm = data[0];
    let speed = data[2];
    let gear = data[3];

    if (rpm === 0 || speed <= 30 || gear > 8 || gear === 0) {
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
        apiRequests();
        for (i in driverList) {
            let number = driverList[i].RacingNumber;
            let name = getDriverName(number);
            let color = getTeamColor(number);
            let data = getCarData(number);
            let crashed = getCarStatus(data);
            let driverElement = document.getElementById(number);
            if (crashed) {
                let driverData = timingData.Lines[number];
                if (
                    driverData.InPit === true ||
                    driverData.Retired === true ||
                    driverData.Stopped === true
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

        await sleep(250);
        if (debug) {
            console.log(count++);
        }
        console.log(document.getElementById("list").childNodes.length);
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
