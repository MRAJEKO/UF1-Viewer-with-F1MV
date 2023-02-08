const debug = false;

// The duration of the sector times being show when completing a sector
// (All times are in MS)
const holdSectorTimeDuration = 4000;
const holdEndOfLapDuration = 4000;
const loopspeed = 80;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");
const { createElement } = require("react");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Apply any configuration from the config.json file
async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

// Toggle the background transparent or not
let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "drag";
        transparent = false;
    } else {
        document.querySelector("body").className = "transparent";
        transparent = true;
    }
}

// Listen to the escape key and toggle the backgrounds transparency when it is pressed
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

// All the api requests
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };

    const liveTimingClock = await f1mvApi.LiveTimingClockAPIGraphQL(config, ["trackTime", "systemTime", "paused"]);

    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "CarData",
        "DriverList",
        "TimingAppData",
        "TimingData",
        "TimingStats",
        "SessionInfo",
    ]);

    carData = liveTimingState.CarData.Entries;
    driverList = liveTimingState.DriverList;
    tireData = liveTimingState.TimingAppData.Lines;
    timingData = liveTimingState.TimingData.Lines;
    timingStats = liveTimingState.TimingStats.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;

    clockData = liveTimingClock;
}

function sortDrivers() {
    const drivers = [];
    for (let position = 1; position <= Object.keys(timingData).length; position++) {
        for (const driver in timingData) {
            const driverTimingData = timingData[driver];

            if (parseInt(driverTimingData.Position) === position) {
                drivers.push(parseInt(driver));
                break;
            }
        }
    }
    return drivers;
}

function removeDriver(driver) {
    const driversContainer = document.querySelector("#wrapper");

    console.log(driversContainer.children);

    const driverElementIndex = [...driversContainer.children].indexOf(document.querySelector(`#driver${driver}`));

    driversContainer.removeChild(driversContainer.children[driverElementIndex]);

    if (driversContainer.children.length <= driverElementIndex) {
        driversContainer.removeChild(driversContainer.children[driverElementIndex - 1]);
        return;
    }
    driversContainer.removeChild(driversContainer.children[driverElementIndex]);
}

function toggleDriver(driver) {
    const driverButton = document.getElementById(`button${driver}`);

    const shownDrivers = [...document.querySelectorAll(".driver")].map((driverElement) =>
        parseInt(driverElement.id.replace("driver", ""))
    );

    // removeDriver(driver);

    if (shownDrivers.includes(driver)) {
        driverButton.style.opacity = null;
        driverButton.style.borderWidth = null;
        removeDriver(driver);
        return;
    }
    driverButton.style.opacity = 1;
    driverButton.style.borderWidth = "1vh";
    addDriver(driver);
}

// A function that sorts the buttons based on their driver number which is formatted as "button(drivernumber)" in the #buttons div and order it based on a array of driver number being inputted
function orderButtons() {
    const driverNumbers = sortDrivers();

    // Find all buttons in the #buttons div
    const driverButtons = document.querySelectorAll("#buttons .driver-button");

    const miscellaneousButtons = document.querySelectorAll("#buttons .miscellaneous-button");

    // Sort the buttons based on the driver numbers
    const sortedButtons = Array.from(driverButtons).sort((a, b) => {
        const aDriverNumber = parseInt(a.id.replace("button", ""));
        const bDriverNumber = parseInt(b.id.replace("button", ""));
        return driverNumbers.indexOf(aDriverNumber) - driverNumbers.indexOf(bDriverNumber);
    });

    // Remove all buttons from the #buttons div
    const buttonsContainer = document.querySelector("#buttons");
    while (buttonsContainer.firstChild) {
        buttonsContainer.removeChild(buttonsContainer.firstChild);
    }

    console.log(sortedButtons);

    // Add the sorted buttons back to the #buttons div
    sortedButtons.forEach((button) => buttonsContainer.appendChild(button));

    miscellaneousButtons.forEach((button) => buttonsContainer.appendChild(button));
}

function addButtons() {
    const drivers = sortDrivers();

    const buttons = document.querySelector("#buttons");

    for (const driver of drivers) {
        const teamColor = driverList[driver].TeamColour;

        const button = document.createElement("button");
        button.id = `button${driver}`;
        button.className = "button driver-button";
        button.style.borderColor = "#" + teamColor;
        button.style.color = "#" + teamColor;
        button.textContent = driverList[driver].Tla;
        button.onclick = () => toggleDriver(driver);
        buttons.appendChild(button);
    }
}

function ordinalForm(num) {
    if (num % 100 >= 11 && num % 100 <= 13) return num + "th";
    const lastDigit = num % 10;
    switch (lastDigit) {
        case 1:
            return num + "st";
        case 2:
            return num + "nd";
        case 3:
            return num + "rd";
        default:
            return num + "th";
    }
}

function addDriver(driver) {
    const sortedDrivers = sortDrivers();

    const driversContainer = document.querySelector("#wrapper");

    const shownDriverElements = document.querySelectorAll(".driver");

    const newElement = document.createElement("div");

    newElement.id = `driver${driver}`;

    newElement.className = "driver";

    newElement.innerHTML = `
    <div class="driver-info">
    <div class="driver-headshot">
            <img
            id="driver-headshot"
                src="${driverList[driver].HeadshotUrl ? driverList[driver].HeadshotUrl.replace("1col", "12col") : ""}"
                alt="" />
                </div>
                <div class="driver-name">
            <div class="first-name"><p id="first-name">${driverList[driver].FirstName}</p></div>
            <div class="last-name"><p id="last-name">${driverList[driver].LastName}</p></div>
        </div>
    </div>
    <div class="pitlane">
        <div class="position">
        <p id="position">${ordinalForm(timingData[driver].Position)}</p>
        </div>
        <div class="tires">
            <div class="current-tire">
            <img id="current-tire" src="" alt="" />
            </div>
            <div class="tire-age">
            <p id="tire-age">16</p>
            </div>
        </div>
        <div class="pit">
        <p id="pit" class="off">P</p>
        </div>
    </div>
    <div class="times">
        <div class="best-time">
        <p class="time-name">Best</p>
            <p class="time-time fastest-time" id="fastest-time">1.25.652</p>
            </div>
        <div class="current-time">
        <p class="time-name">Current</p>
            <p class="time-time slow" id="current-time">1.26.723</p>
        </div>
    </div>
    <div class="telemetry">
        <div class="drs">
        <p class="off" id="drs">DRS</p>
        </div>
        <div class="speed">
            <p class="speed-number" id="speed">256</p>
            <p class="metric" id="metric">km/h</p>
        </div>
        <div class="pedals">
        <div class="pedal">
                <div class="green" id="throttle"></div>
                </div>
            <div class="pedal">
            <div class="red" id="brake"></div>
            </div>
        </div>
        </div>`;

    const gapElement = document.createElement("div");
    gapElement.className = "gap";
    gapElement.id = `gap${driver}`;
    gapElement.innerHTML = `
    <div class="line"></div>
    <div class="gap-time">
    <p class="gap-time-time">3.456</p>
    <p class="gap-time-format">SECONDS</p>
    </div>
    <div class="line"></div>`;

    for (const shownDriverElement of shownDriverElements) {
        const shownDriver = parseInt(shownDriverElement.id.replace("driver", ""));

        if (sortedDrivers.indexOf(shownDriver) > sortedDrivers.indexOf(driver)) {
            driversContainer.insertBefore(newElement, shownDriverElement);

            driversContainer.insertBefore(gapElement, shownDriverElement);
            return;
        }

        console.log(shownDriver);
    }

    if (driversContainer.children.length > 0) driversContainer.appendChild(gapElement);
    driversContainer.appendChild(newElement);
}

let oldData = "";
async function setSpeed() {
    const shownDriverElements = document.querySelectorAll(".driver");

    for (const shownDriverElement of shownDriverElements) {
        const driver = parseInt(shownDriverElement.id.replace("driver", ""));

        oldData = carData[0].Utc;

        const currentTirePath = `../icons/tires/${tireData[driver].Stints.slice(-1)[0].Compound.toLowerCase()}.png`;

        document.querySelector(`#driver${driver} #current-tire`).src = currentTirePath;

        for (const data in carData) {
            if (oldData === carData[0].Utc) break;

            const currentData = carData[data];
            const nextData = carData[parseInt(data) + 1];

            document.querySelector(`#driver${driver} #speed`).textContent = currentData.Cars[driver].Channels[2];

            document.querySelector(`#driver${driver} #throttle`).style.width =
                currentData.Cars[driver].Channels[4] + "%";

            document.querySelector(`#driver${driver} #brake`).style.width =
                currentData.Cars[driver].Channels[5] * 100 + "%";

            if (nextData === undefined) {
                break;
            }

            const dataInterval = new Date(nextData.Utc) - new Date(currentData.Utc);

            await sleep(dataInterval);
        }
    }
}

async function run() {
    await getConfigurations();
    await apiRequests();
    addButtons();
    while (true) {
        await sleep(100);
        await apiRequests();
        sortDrivers();
        await setSpeed();
    }
}
run();
