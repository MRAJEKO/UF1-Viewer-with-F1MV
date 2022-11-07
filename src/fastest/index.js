// Set is file is being debuged
const debug = false;

// Create sleep function to use as wait inside of loops
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Toggle the background from gray to transparent by giving or removing the class transparent and checking if transparent is set to 'true'
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

// Check if 'escape' is being pressed to trigger 'toggleBackground'
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

// Function to return the API request
function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}
// Create empty variables
let driverList;
let timingStats;

// Request 'DriverList' and 'TimingStats' from the api and add them to their variables
function requestApi() {
    let api = JSON.parse(
        httpGet(
            "http://localhost:10101/api/v2/live-timing/state/DriverList,TimingStats"
        )
    );
    driverList = api.DriverList;
    timingStats = api.TimingStats.Lines;
}

// Function to return the element by giving the 'id' from the element
function getElement(id) {
    return document.getElementById(id);
}

// Get the icons for the separate teams
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

// Set the value of the sector to his information that was requested
async function setSector(sectorNumber) {
    // For every driver in 'timingStats'
    for (i in timingStats) {
        // Check if the 'sectorNumber' that is being send as an argument is in first position (the fastest) and continue if 'true'
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
            // Get all the information for the fastest driver
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
            // If there is no time set. Change the values to a default state
            if (time == "") {
                time = "NO TIME";
                lastName = "NO DRIVER";
                icon = "noicon.png";
                color = "white";
            }
            // Set the information to their position
            getElement("s" + sectorNumber + "img").src = "../icons/" + icon;
            getElement("s" + sectorNumber + "img").style.backgroundColor =
                color;
            getElement("s" + sectorNumber + "name").innerHTML = lastName;
            getElement("s" + sectorNumber).innerHTML = time;
        }
    }
}

// Set the fastest sector by running 'setSector' and giving the sector number as a argument
async function setFastestSectors() {
    setSector(1);
    setSector(2);
    setSector(3);
}

// Set the value of the lap at the position given as an argument.
async function setLap(position) {
    // Repeat for every driver inside of the 'timingStats'
    for (i in timingStats) {
        // If the best position is less or equal to 'amount' (the amount of drivers shown) continue
        if (timingStats[i].PersonalBestLapTime.Position == position) {
            // Get all the needed information from the driver
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
            // Set the information to their position on the list
            getElement("lapimg" + position).src = "../icons/" + icon;
            getElement("lapimg" + position).style.backgroundColor = color;
            getElement("lapname" + position).innerHTML = lastName;
            getElement("lap" + position).innerHTML = time;
        }
    }
}

// Set the fastest laps by running 'setLap' and giving the lap number position as a argument
function setFastestLaps() {
    setLap(1);
    setLap(2);
    setLap(3);
}

// Set the value of the speed at the type and position given as an argument.
async function setSpeed(type, position) {
    // Repeat for every driver inside of the 'timingStats'
    for (i in timingStats) {
        // If the best position is less or equal to 'amount' (the amount of drivers shown) continue
        if (
            timingStats[i].BestSpeeds[type.toUpperCase()].Position == position
        ) {
            // Get all the needed information from the driver
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
            // Set the information to their position on the list
            getElement(type + "img" + position).src = "../icons/" + icon;
            getElement(type + "img" + position).style.backgroundColor = color;
            getElement(type + "name" + position).innerHTML = lastName;
            getElement(type + position).innerHTML = time + " km/h";
        }
    }
}

// Set the fastest speeds by running 'setSpeed' and giving the type (st (Speed trap), fl (Finish line), i1 (Sector 1), i2 (Sector 2)) and the postion as an argument
async function setSpeeds() {
    await setSpeed("st", 1);
    await setSpeed("st", 2);
    await setSpeed("st", 3);
    await setSpeed("fl", 1);
    await setSpeed("fl", 2);
    await setSpeed("fl", 3);
}

// Run all the functions
let count = 0;
async function run() {
    // Loop forever (true is always true)
    while (true) {
        requestApi();
        await setFastestLaps();
        await setFastestSectors();
        await setSpeeds();
        // Wait for 2 second to rerun
        await sleep(2000);
        count++;
        if (debug) {
            console.log(count);
        }
    }
}
run();
