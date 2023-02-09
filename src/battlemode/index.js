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

    const misc = document.querySelectorAll("#buttons .misc-button");

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

    misc.forEach((button) => buttonsContainer.appendChild(button));
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

function toggleMisc(type) {
    const miscButton = document.getElementById(type);

    const miscButtonsContainer = document.querySelector("#buttons");

    const miscButtons = [...document.querySelectorAll(".misc-button")];

    const parts = document.querySelectorAll(`.${type}`);
    if (miscButtons.includes(miscButton)) {
        for (const part of parts) part.style.display = "inherit";

        miscButton.remove();
        return;
    }

    for (const part of parts) part.style.display = "none";

    const button = document.createElement("button");
    button.id = type;
    button.className = "button misc-button";
    button.style.borderColor = "green";
    button.style.color = "green";
    button.textContent = type;
    button.onclick = () => toggleMisc(type);
    miscButtonsContainer.appendChild(button);
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

    const times = document.querySelectorAll(".times")[0]
        ? document.querySelectorAll(".times")[0].style.display === "none"
            ? "none"
            : "inherit"
        : "inherit";

    const telemetry = document.querySelectorAll(".telemetry")[0]
        ? document.querySelectorAll(".telemetry")[0].style.display === "none"
            ? "none"
            : "inherit"
        : "inherit";

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
            <div class="last-name"><p id="last-name" style="color: #${driverList[driver].TeamColour};">${
        driverList[driver].LastName
    }</p></div>
        </div>
    </div>
    <div class="pitlane">
        <div class="position">
        <p id="position"></p>
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
    <div class="times Time" style="display: ${times};" id="times" onclick="toggleMisc('Time')">
        <div class="best-time">
        <p class="time-name">Best</p>
            <p class="time-time fastest-time" id="fastest-time">1.25.652</p>
            </div>
        <div class="current-time">
        <p class="time-name">Last</p>
            <p class="time-time slow" id="current-time">1.26.723</p>
        </div>
    </div>
    <div class="telemetry Tel" style="display: ${telemetry};" id="telemetry" onclick="toggleMisc('Tel')">
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

function reorderDrivers(shownDriverElements) {
    const driversContainer = document.querySelector("#wrapper");

    driversContainer.innerHTML = "";

    for (const shownDriverElement of shownDriverElements) {
        const shownDriver = parseInt(shownDriverElement.id.replace("driver", ""));

        addDriver(shownDriver);
    }
}

let oldData = "";
let telemetryWidth = 0;
let timeWidth = 0;
async function setData() {
    const shownDriverElements = document.querySelectorAll(".driver");

    const gapElements = document.querySelectorAll(".gap");

    if (shownDriverElements.length > 0) {
        const windowWidth = window.innerWidth;
        const margin = window.innerHeight;
        const gap = (window.innerHeight / 100) * 7;
        const telemetryWidth = (window.innerHeight / 100) * 50 + gap;
        const timeWidth = (window.innerHeight / 100) * 40 + gap;

        const driverElementWidth = shownDriverElements[0].offsetWidth;

        const amountOfDriversFit = Math.floor((windowWidth - margin) / (driverElementWidth + margin));

        console.log(amountOfDriversFit);

        // Variable telemetry and times that are true or false depending on if they are shown or not
        const telemetry = document.querySelectorAll(".telemetry")[0]
            ? document.querySelectorAll(".telemetry")[0].style.display === "none"
                ? false
                : true
            : true;
        const times = document.querySelectorAll(".times")[0]
            ? document.querySelectorAll(".times")[0].style.display === "none"
                ? false
                : true
            : true;

        const driversWidths = driverElementWidth * shownDriverElements.length;
        const marginWidths = margin * (shownDriverElements.length - 1);
        const telemetryWidths = telemetryWidth * shownDriverElements.length;
        const timeWidths = timeWidth * shownDriverElements.length;
        // if (!telemetry && driverElementWidth * shownDriverElements.length)

        console.log(!telemetry && driversWidths + marginWidths + telemetryWidths < windowWidth);
        console.log(!times && driversWidths + marginWidths + timeWidths < windowWidth);

        if (windowWidth < driverElementWidth * shownDriverElements.length + margin * (shownDriverElements.length - 1)) {
            if (telemetry) {
                toggleMisc("Tel");
            } else if (times) {
                toggleMisc("Time");
            }
        } else {
            if (!telemetry && driversWidths + marginWidths + telemetryWidth + timeWidths < windowWidth) {
                toggleMisc("Tel");
            } else if (!times && driversWidths + marginWidths + timeWidths < windowWidth) {
                toggleMisc("Time");
            }
        }
    }

    if (shownDriverElements.length === 0) return;

    let position = 1;
    for (
        let shownDriverElementIndex = 0;
        shownDriverElementIndex < shownDriverElements.length;
        shownDriverElementIndex++
    ) {
        const shownDriverElement = shownDriverElements[shownDriverElementIndex];

        const currentDriver = parseInt(shownDriverElement.id.replace("driver", ""));

        if (parseInt(timingData[currentDriver].Position) < position) {
            reorderDrivers(shownDriverElements);
            return;
        }
        position = parseInt(timingData[currentDriver].Position);
    }

    for (let gapElementIndex = 0; gapElementIndex < gapElements.length; gapElementIndex++) {
        const gapElement = gapElements[gapElementIndex];

        gapElement.id = `gap${shownDriverElements[gapElementIndex].id.replace("driver", "")}`;
    }
    for (
        let shownDriverElementIndex = 0;
        shownDriverElementIndex < shownDriverElements.length;
        shownDriverElementIndex++
    ) {
        const shownDriverElement = shownDriverElements[shownDriverElementIndex];

        const currentDriver = parseInt(shownDriverElement.id.replace("driver", ""));

        const currentShownDriverPosition = parseInt(timingData[currentDriver].Position);

        const sortedDrivers = sortDrivers();

        const currentDriverTimingData = timingData[sortedDrivers[currentShownDriverPosition - 1]];

        const nextShownDriverElement = shownDriverElements[shownDriverElementIndex + 1];

        if (nextShownDriverElement) {
            const nextDriver = parseInt(nextShownDriverElement.id.replace("driver", ""));

            const nextShownDriverPosition = parseInt(timingData[nextDriver].Position);

            const nextDriverTimingData = timingData[sortedDrivers[nextShownDriverPosition - 1]];

            let gap = nextDriverTimingData.IntervalToPositionAhead.Value.includes("L") ? "LAPPED" : 0;

            if (currentShownDriverPosition === 1) {
                if (
                    !currentDriverTimingData.GapToLeader.includes("L") &&
                    !nextDriverTimingData.GapToLeader.includes("L")
                ) {
                    gap = parseInt(nextDriverTimingData.GapToLeader) - parseInt(currentDriverTimingData.GapToLeader);
                } else {
                    gap = parseFloat(nextDriverTimingData.GapToLeader.slice(1));
                }
            } else if (!nextDriverTimingData.IntervalToPositionAhead.Value.includes("L")) {
                for (let position = nextShownDriverPosition; position > currentShownDriverPosition; position--) {
                    const driverGapPosAhead = timingData[sortedDrivers[position - 1]].IntervalToPositionAhead.Value;

                    if (driverGapPosAhead.includes("L")) {
                        gap = "LAPPED";
                        break;
                    }

                    if (
                        driverGapPosAhead === "" &&
                        (timingData[sortedDrivers[position - 1]].Retired ||
                            timingData[sortedDrivers[position - 1]].Stopped)
                    ) {
                        gap = "RETIRED";
                        break;
                    }

                    if (driverGapPosAhead === "") {
                        gap = "UNKNOWN";
                        break;
                    }

                    const selectedDriverGapAhead = parseFloat(driverGapPosAhead.slice(1));

                    gap += selectedDriverGapAhead;
                }
            }
            const gapElement = document.querySelector(`#gap${currentDriver}`);

            gapElement.querySelector(".gap-time-time").textContent = isNaN(gap)
                ? gap
                : gap > 0
                ? `+${gap.toFixed(3)}`
                : `-${gap}`;

            gapElement.querySelector(".gap-time-time").className =
                "gap-time-time " + (isNaN(gap) ? "red-text" : gap > 1 ? "" : "personal-best");
        }

        const currentTire = tireData[currentDriver].Stints.slice(-1)[0];

        const currentTirePath = `../icons/tires/${currentTire.Compound.toLowerCase()}.png`;

        const currentTireAge = currentTire.TotalLaps;

        document.querySelector(`#driver${currentDriver} #current-tire`).src = currentTirePath;

        document.querySelector(`#driver${currentDriver} #tire-age`).textContent = currentTireAge;

        const position = ordinalForm(timingData[currentDriver].Position);

        document.querySelector(`#driver${currentDriver} #position`).textContent = position;

        const pitStatus = timingData[currentDriver].InPit;

        pitStatus
            ? (document.querySelector(`#driver${currentDriver} #pit`).className = "")
            : (document.querySelector(`#driver${currentDriver} #pit`).className = "off");

        if (document.getElementById("times").display === "none") return;
        // Set lap times
        const bestLap = timingStats[currentDriver].PersonalBestLapTime;

        document.querySelector(`#driver${currentDriver} #fastest-time`).textContent = bestLap.Value;
        document.querySelector(`#driver${currentDriver} #fastest-time`).className =
            (bestLap.Position === 1 ? "fastest-time" : "personal-best") + " time-time";

        const lastLap = timingData[currentDriver].LastLapTime;

        document.querySelector(`#driver${currentDriver} #current-time`).textContent = lastLap.Value;
        document.querySelector(`#driver${currentDriver} #current-time`).className =
            (lastLap.OverallFastest ? "fastest-time" : lastLap.PersonalFastest ? "personal-best" : "slow") +
            " time-time";

        if (document.getElementById("telemetry").display === "none") return;
        // Set car data
        if (oldData === carData[0].Utc) break;

        const drsData = carData[0].Cars[currentDriver].Channels[45];

        const drsStatus = drsData === 10 || drsData === 12 || drsData === 14;

        document.querySelector(`#driver${currentDriver} #drs`).className = drsStatus ? "" : "off";
    }

    if (oldData === carData[0].Utc) return;

    oldData = carData[0].Utc;
    for (const data in carData) {
        const currentData = carData[data];
        const nextData = carData[parseInt(data) + 1];

        for (const shownDriverElement of shownDriverElements) {
            const driver = parseInt(shownDriverElement.id.replace("driver", ""));

            try {
                document.querySelector(`#driver${driver} #speed`).textContent = currentData.Cars[driver].Channels[2];

                document.querySelector(`#driver${driver} #throttle`).style.width =
                    currentData.Cars[driver].Channels[4] + "%";

                document.querySelector(`#driver${driver} #brake`).style.width =
                    currentData.Cars[driver].Channels[5] * 100 + "%";
            } catch (e) {
                console.log("Driver has been removed");
                return;
            }
        }

        if (nextData === undefined) {
            break;
        }

        const dataInterval = new Date(nextData.Utc) - new Date(currentData.Utc);

        await sleep(dataInterval);
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
        await setData();
    }
}
run();
