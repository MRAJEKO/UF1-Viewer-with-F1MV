// URL output function
function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

// Set basic info
const flag = document.getElementById("flag");
const chequered = document.getElementById("chequeredFlag");
const extra = document.getElementById("extra");
let host = "localhost";
let port = 10101;

// Set trackstatus output
let trackStatus = JSON.parse(
    httpGet(`http://${host}:${port.toString()}/api/v1/live-timing/TrackStatus`)
);

if (trackStatus.error === "No data found, do you have live timing running?") {
    console.log(
        "Live timing screen is not running. Refresh when it is running."
    );
}

let safetyCar = 0;
let virtualSafetyCar = 0;
let virtualSafetyCarEnding = 0;
let trackClear = 0;
let chequeredFlag = 0;
let fastestLapCounter = 0;
let fastestLapTime = "";
let oldFastestLapTime = "";

const noLiveTiming = async () => {
    while (
        trackStatus.error === "No data found, do you have live timing running?"
    ) {
        console.log(trackStatus.error);
        await sleep(5000);
    }
};

let hidden = false;

let toggle = true;

function hideFlag() {
    if (toggle) {
        console.log("Flag Hidden");
        hidden = true;
        flag.classList.add("hidden");
        chequered.classList.add("hidden");
        extra.classList.add("hidden");
        toggle = false;
    } else {
        toggle = true;

        console.log("Flag shown");
        hidden = false;
        updatestatus();
        flag.classList.remove("hidden");
        chequered.classList.remove("hidden");
    }
}

// Update track status
const updatestatus = async () => {
    while (
        trackStatus.error !==
            "No data found, do you have live timing running?" &&
        hidden != true
    ) {
        let trackStatus = JSON.parse(
            httpGet(
                `http://${host}:${port.toString()}/api/v1/live-timing/TrackStatus`
            )
        );

        // Chequered Flag
        let finished = JSON.parse(
            httpGet(
                `http://${host}:${port.toString()}/api/v1/live-timing/SessionStatus`
            )
        );
        if (finished.Status === "Finished" && chequeredFlag === 0) {
            console.log("Chequered Flag");
            chequered.classList.add("chequered");
            await sleep(3000);
            chequered.classList.remove("chequered");
            chequeredFlag = 1;
            trackClear = 1;
        }
        if (finished.Status === "Finished") {
        } else chequeredFlag = 0;

        // Fastest Lap
        let carList = JSON.parse(
            httpGet(
                `http://${host}:${port.toString()}/api/v1/live-timing/TimingData`
            )
        ).Lines;
        for (i in carList) {
            let fastestLap = carList[i].LastLapTime.OverallFastest;
            fastestLapTime = carList[i].LastLapTime.Value;
            if (
                (fastestLap === true && fastestLapCounter === 0) ||
                (fastestLap === true && fastestLapTime !== oldFastestLapTime)
            ) {
                oldFastestLapTime = fastestLapTime;
                fastestLapCounter = 1;
                trackClear = 1;
                extra.classList.add("fastestLap");
                await sleep(2000);
                extra.classList.remove("fastestLap");
            }
        }

        flag.className = "black";
        // Status 1 - Track Clear
        if (trackStatus.Status === "1") {
            if (trackClear === 0) {
                console.log("Track Clear");
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
            console.log("Yellow Flag");
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
            console.log("Red Flag");
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

    // If a Safety Car Occurs
    function SC() {
        console.log("Safety Car");
        safetyCar = 1;
        trackClear = 0;
        async function blinking() {
            i = 0;
            while (i != 10) {
                flag.className = "";
                flag.classList.add("black");
                await sleep(250);
                flag.className = "";
                flag.classList.add("yellow");
                await sleep(250);
                i++;
            }
        }
        blinking();
    }

    // If a Virtual Safety Car Occurs
    function VSC() {
        console.log("Virtual Safety Car");
        virtualSafetyCar = 1;
        trackClear = 0;
        async function blinking() {
            i = 0;
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
        blinking();
    }
};
updatestatus();

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// {Status: "3", Message: ""}
// {Status: "4", Message: "SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
