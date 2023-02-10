const debug = false;

const f1mvApi = require("npm_f1mv_api");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Set basic info
const flag = document.getElementById("flag");
const extra = document.getElementById("extra");
const chequered = document.getElementById("chequered");

async function getConfigurations() {
    const configfile = require("../settings/config.json").current;
    host = configfile.network.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    config = {
        host: host,
        port: port,
    };
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

let prevTrackStatus;
let prevSessionStatus;
let prevFastestLap;
async function getCurrentStatus() {
    const data = await f1mvApi.LiveTimingAPIGraphQL(config, ["TrackStatus", "SessionStatus", "TimingData"]);

    const trackStatus = parseInt(data.TrackStatus.Status);
    if (trackStatus !== prevTrackStatus) {
        prevTrackStatus = trackStatus;
        switch (trackStatus) {
            case 1:
                flag.classList.remove("red");
                flag.classList.remove("yellow");
                flag.classList.add("green");
                await sleep(5000);
                flag.classList.remove("green");
                break;
            case 2:
                flag.classList.add("yellow");
                break;
            case 4:
                await blink("yellow", 3, 500);
                flag.classList.add("yellow");
                break;
            case 5:
                flag.classList.remove("yellow");
                flag.classList.add("red");
                break;
            case 6:
            case 7:
                await blink("yellow", 3, 750);
                flag.classList.add("yellow");
                break;
        }
    }

    const sessionStatus = data.SessionStatus.Status;
    if (sessionStatus === "Finished" && prevSessionStatus !== sessionStatus) {
        prevSessionStatus = sessionStatus;
        chequered.classList.remove("hidden");
        await sleep(30000);
        chequered.classList.add("hidden");
    }

    console.log(trackStatus);

    const timingData = data.TimingData.Lines;
    for (const driverNumber in timingData) {
        const driverTimingData = timingData[driverNumber];

        const driverFastestLap = driverTimingData.LastLapTime.OverallFastest;
        const driverFastestLapTime = driverTimingData.LastLapTime.Value;

        if (driverFastestLap) {
            console.log(driverFastestLap && driverFastestLapTime !== prevFastestLap);
        }

        if (driverFastestLap && driverFastestLapTime !== prevFastestLap) {
            prevFastestLap = driverFastestLapTime;
            extra.classList.add("fastest-lap");
            await sleep(3000);
            extra.classList.remove("fastest-lap");
        }
    }
}

async function blink(color, amount, interval) {
    for (let count = 0; count < amount; count++) {
        flag.classList.add(color);
        await sleep(interval);
        flag.classList.remove(color);
        await sleep(interval);
    }
}

async function run() {
    await getConfigurations();

    setInterval(async () => {
        await getCurrentStatus();
    }, 250);
}

run();

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// {Status: "3", Message: ""}
// {Status: "4", Message: "SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
