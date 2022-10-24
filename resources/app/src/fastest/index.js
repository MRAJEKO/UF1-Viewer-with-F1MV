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
let timingData;

function requestApi() {
    let api = JSON.parse(
        httpGet(
            "http://localhost:10101/api/v2/live-timing/state/DriverList,TimingData"
        )
    );
    driverList = api.DriverList;
    timingData = api.TimingData.Lines;
}

function timeToMs(time) {
    let minutes = time.split(":")[0];
    let seconds = time.split(":")[1];
    let timeSeconds = +minutes * 60 + +seconds;
    return timeSeconds;
}

function msToTime(seconds) {
    let minutes = Math.floor(seconds / 60).toString();
    seconds -= +minutes * 60;
    seconds = seconds.toFixed(3);
    let time = minutes + ":" + seconds;
    return time;
}

function getNumberFromTimes(times) {
    let driverNumbers = [];
    for (i in times) {
        for (index in timingData) {
            if (timingData[index].BestLapTime.Value == times[i]) {
                let number = timingData[index].RacingNumber;
                driverNumbers.push(number);
                if (debug) {
                    console.log(number);
                }
            }
        }
    }
    return driverNumbers;
}

function sortLaps() {
    let times = [];
    for (i in timingData) {
        let bestLapTime = timingData[i].BestLapTime.Value;
        if (bestLapTime != "") {
            let bestLapMS = timeToMs(bestLapTime);
            times.push(+bestLapMS);
        }
    }
    times.sort(function (a, b) {
        return a - b;
    });
    console.log(times);
    let sortedTimes = [];
    for (i in times) {
        sortedTimes.push(msToTime(times[i]));
    }
    if (debug) {
        console.log(times);
        console.log(sortedTimes);
    }
    return sortedTimes;
}

function sortSectors() {}

function sortSpeeds() {}

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
async function setFastestLaps(sortedNumbers) {
    console.log("Fastest laps");
    let amount = 3;
    let firstFew = sortedNumbers.slice(0, amount);
    console.log(sortedNumbers);
    console.log(firstFew);
    for (i in firstFew) {
        let lastName = driverList[firstFew[i]].LastName.toUpperCase();
        let icon = icons[driverList[firstFew[i]].TeamName];
        let color = "#" + driverList[firstFew[i]].TeamColour;
        let time = timingData[firstFew[i]].BestLapTime.Value;
        if (debug) {
            console.log(lastName);
            console.log(icon);
            console.log(color);
            console.log(time);
        }
        if (getElement("lap" + (+i + 1)).innerHTML != time) {
            let reveal = getElement("lapreveal" + (+i + 1));
            console.log(reveal);
            reveal.className = "reveal animation-center";
            await sleep(1000);
            getElement("lapimg" + (+i + 1)).src = "../icons/" + icon;
            getElement("lapimg" + (+i + 1)).style.backgroundColor = color;
            getElement("lapname" + (+i + 1)).innerHTML = lastName;
            getElement("lap" + (+i + 1)).innerHTML = time;
            await sleep(1000);
            reveal.className = "reveal animation-end";

            await sleep(1000);
            reveal.className = "reveal animation-start";
        }
    }
}
let count = 0;
async function run() {
    while (true) {
        requestApi();
        let sortedTimes = sortLaps();
        if (sortedTimes == "") {
            return;
        }
        let sortedNumbers = getNumberFromTimes(sortedTimes);
        await setFastestLaps(sortedNumbers);
        await sleep(1000);
        count++;
        if (debug) {
            console.log(count);
        }
    }
}

run();
