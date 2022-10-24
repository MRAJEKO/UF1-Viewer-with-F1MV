const debug = false;

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

function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

let driverList;
let timingStats;

function requestApi() {
    let api = JSON.parse(
        httpGet(
            "http://localhost:10101/api/v2/live-timing/state/DriverList,TimingStats"
        )
    );
    driverList = api.DriverList;
    timingStats = api.TimingStats.Lines;
}

function getElement(id) {
    return document.getElementById(id);
}

const icons = {
    "Red Bull Racing": "red-bull.png",
    McLaren: "mclaren-white.png",
    "Aston Martin": "aston-martin.png",
    Williams: "williams-white.png",
    AlphaTauri: "alpha-tauri.png",
    Alpine: "alpine.png",
    Ferrari: "ferrari.png",
    "Haas F1 Team": "haas-red.png",
    "Alfa Romeo": "alfa-romeo.png",
    Mercedes: "mercedes.png",
};
async function setFastestLaps() {
    let amount = 3;
    let count = 1;
    for (i in timingStats) {
        if (timingStats[i].PersonalBestLapTime.Position < amount + 1) {
            let lastName = driverList[i].LastName.toUpperCase();
            let icon = icons[driverList[i].TeamName];
            let color = "#" + driverList[i].TeamColour;
            let time = timingStats[i].PersonalBestLapTime.Value;
            if (debug) {
                console.log(lastName);
                console.log(icon);
                console.log(color);
                console.log(count);
                console.log(getElement("lap" + count).innerHTML);
                console.log(time);
            }
            if (getElement("lap" + count).innerHTML != time) {
                let reveal = getElement("lapreveal" + count);
                console.log(reveal);
                reveal.className = "reveal animation-center";
                await sleep(1000);
                getElement("lapimg" + count).src = "../icons/" + icon;
                getElement("lapimg" + count).style.backgroundColor = color;
                getElement("lapname" + count).innerHTML = lastName;
                getElement("lap" + count).innerHTML = time;
                await sleep(1000);
                reveal.className = "reveal animation-end";

                await sleep(1000);
                reveal.className = "reveal animation-start";
            }
            count++;
        }
    }
}

async function setSector(sectorNumber) {
    for (i in timingStats) {
        if (timingStats[i].BestSectors[sectorNumber - 1].Position == 1) {
            if (debug) {
                console.log(
                    "S" +
                        sectorNumber +
                        ": " +
                        i +
                        " - " +
                        timingStats[i].BestSectors[sectorNumber - 1].Value
                );
            }
            let lastName = driverList[i].LastName.toUpperCase();
            let icon = icons[driverList[i].TeamName];
            let color = "#" + driverList[i].TeamColour;
            let time = timingStats[i].BestSectors[sectorNumber - 1].Value;
            if (debug) {
                console.log(lastName);
                console.log(icon);
                console.log(color);
                console.log(time);
            }
            if (time == "") {
                time = "NO TIME";
                lastName = "NO DRIVER";
                icon = "noicon.png";
                color = "white";
            }
            if (getElement("s" + sectorNumber).innerHTML != time) {
                let reveal = getElement("sreveal" + sectorNumber);
                reveal.className = "reveal animation-center";
                await sleep(1000);
                getElement("s" + sectorNumber + "img").src = "../icons/" + icon;
                getElement("s" + sectorNumber + "img").style.backgroundColor =
                    color;
                getElement("s" + sectorNumber + "name").innerHTML = lastName;
                getElement("s" + sectorNumber).innerHTML = time;
                await sleep(1000);
                reveal.className = "reveal animation-end";

                await sleep(1000);
                reveal.className = "reveal animation-start";
            }
        }
    }
}

async function setFastestSectors() {
    setSector(1);
    setSector(2);
    setSector(3);
}

async function setLap(position) {
    for (i in timingStats) {
        if (timingStats[i].PersonalBestLapTime.Position == position) {
            let lastName = driverList[i].LastName.toUpperCase();
            let icon = icons[driverList[i].TeamName];
            let color = "#" + driverList[i].TeamColour;
            let time = timingStats[i].PersonalBestLapTime.Value;
            if (debug) {
                console.log(lastName);
                console.log(icon);
                console.log(color);
                console.log(position);
                console.log(getElement("lap" + position).innerHTML);
                console.log(time);
            }
            if (getElement("lap" + position).innerHTML != time) {
                let reveal = getElement("lapreveal" + position);
                reveal.className = "reveal animation-center";
                await sleep(1000);
                getElement("lapimg" + position).src = "../icons/" + icon;
                getElement("lapimg" + position).style.backgroundColor = color;
                getElement("lapname" + position).innerHTML = lastName;
                getElement("lap" + position).innerHTML = time;
                await sleep(1000);
                reveal.className = "reveal animation-end";

                await sleep(1000);
                reveal.className = "reveal animation-start";
            }
        }
    }
}

function setFastestLaps() {
    setLap(1);
    setLap(2);
    setLap(3);
}

async function setSpeeds() {
    await setSpeed("st", 1);
    await setSpeed("st", 2);
    await setSpeed("st", 3);
    await setSpeed("fl", 1);
    await setSpeed("fl", 2);
    await setSpeed("fl", 3);
}

async function setSpeed(type, position) {
    for (i in timingStats) {
        if (
            timingStats[i].BestSpeeds[type.toUpperCase()].Position == position
        ) {
            let lastName = driverList[i].LastName.toUpperCase();
            let icon = icons[driverList[i].TeamName];
            let color = "#" + driverList[i].TeamColour;
            let time = timingStats[i].BestSpeeds[type.toUpperCase()].Value;
            if (debug) {
                console.log(lastName);
                console.log(icon);
                console.log(color);
                console.log(position);
                console.log(getElement(type + position).innerHTML);
                console.log(time);
            }
            if (getElement(type + position).innerHTML != time + " km/h") {
                let reveal = getElement(type + "reveal" + position);
                reveal.className = "reveal animation-center";
                await sleep(1000);
                getElement(type + "img" + position).src = "../icons/" + icon;
                getElement(type + "img" + position).style.backgroundColor =
                    color;
                getElement(type + "name" + position).innerHTML = lastName;
                getElement(type + position).innerHTML = time + " km/h";
                await sleep(1000);
                reveal.className = "reveal animation-end";

                await sleep(1000);
                reveal.className = "reveal animation-start";
            }
        }
    }
}

let count = 0;
async function run() {
    while (true) {
        requestApi();
        await setFastestLaps();
        await setFastestSectors();
        await setSpeeds();
        await sleep(2000);
        count++;
        if (debug) {
            console.log(count);
        }
    }
}

run();
