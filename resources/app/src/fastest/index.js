const debug = true;

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
    console.log("Fastest laps");
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

let count = 0;
async function run() {
    while (true) {
        requestApi();
        await setFastestLaps();
        await sleep(1000);
        count++;
        if (debug) {
            console.log(count);
        }
    }
}

run();
