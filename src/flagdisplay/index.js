const debug = false;

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

// Set basic info
const flag = document.getElementById("flag");
const extra = document.getElementById("extra");
let trackStatus;

function apiRequests() {
    let api = JSON.parse(
        httpGet(
            `http://localhost:10101/api/v2/live-timing/state/TrackStatus,TimingData`
        )
    );
    timingData = api.TimingData.Lines;
    trackStatus = api.TrackStatus;
    if (debug) {
        console.log(trackStatus);
        console.log(timingData);
    }
}

let safetyCar = 0;
let virtualSafetyCar = 0;
let virtualSafetyCarEnding = 0;
let trackClear = 0;
let chequeredFlag = 0;
let fastestLapCounter = 0;
let fastestLapTime = "";
let oldFastestLapTime = "";

async function blinking() {
    let i = 0;
    while (i != 5) {
        flag.className = "";
        flag.classList.add("black");
        await sleep(500);
        flag.className = "";
        flag.classList.add("yellow");
        await sleep(500);
        i++;
    }
}

// If a Safety Car Occurs
async function SC() {
    if (debug) {
        console.log("Safety Car");
    }
    safetyCar = 1;
    trackClear = 0;
    await blinking();
}

// If a Virtual Safety Car Occurs
async function VSC() {
    if (debug) {
        console.log("Virtual Safety Car");
    }
    virtualSafetyCar = 1;
    trackClear = 0;
    await blinking();
}

// Update track status
async function updateStatus() {
    while (true) {
        apiRequests();
        for (i in timingData) {
            let fastestLap = timingData[i].LastLapTime.OverallFastest;
            fastestLapTime = timingData[i].LastLapTime.Value;
            if (debug) {
                console.log(fastestLapTime);
                console.log(oldFastestLapTime);
            }
            if (
                (fastestLap === true && fastestLapCounter === 0) ||
                (fastestLap === true && fastestLapTime !== oldFastestLapTime)
            ) {
                oldFastestLapTime = fastestLapTime;
                fastestLapCounter = 1;
                trackClear = 1;
                extra.classList.add("fastestLap");
                if (debug) console.log("fastestLap");
                await sleep(2000);
                extra.classList.remove("fastestLap");
            }
            if (debug) {
                console.log(fastestLap);
            }
        }

        flag.className = "black";
        // Status 1 - Track Clear
        if (trackStatus.Status === "1") {
            if (trackClear === 0) {
                if (debug) {
                    console.log("Track Clear");
                }
                trackClear = 1;
                flag.classList.add("green");
                await sleep(5000);
            }

            safetyCar = 0;
            virtualSafetyCar = 0;
            virtualSafetyCarEnding = 0;
        }

        // Status 2 - Yellow Flag
        if (trackStatus.Status === "2") {
            if (debug) {
                console.log("Yellow Flag");
            }
            flag.classList.add("yellow");
            trackClear = 0;
        }

        // Status 3 - Unknown
        if (trackStatus.Status === "3") {
        }

        //Status 4 - Safety Car
        if (trackStatus.Status === "4") {
            if (safetyCar == 0) {
                SC();
                await sleep(5000);
            } else {
                flag.classList.add("yellow");
            }
        }

        // Status 5 - Red Flag
        if (trackStatus.Status === "5") {
            if (debug) {
                console.log("Red Flag");
            }
            flag.classList.add("red");
            safetyCar = 0;
            virtualSafetyCar = 0;
        }

        // Status 6 - Virtual Safety Car Deployed
        if (trackStatus.Status === "6") {
            if (virtualSafetyCar == 0) {
                VSC();
                await sleep(5000);
            } else flag.classList.add("yellow");
        }
        // Status 7 - Virtual Safety Car Ending
        if (trackStatus.Status === "7") {
            if (virtualSafetyCarEnding === 0) {
                virtualSafetyCarEnding = 1;
                VSC();
                await sleep(5000);
            } else flag.classList.add("yellow");
        }
        await sleep(500);
    }
}
updateStatus();

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// {Status: "3", Message: ""}
// {Status: "4", Message: "SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
