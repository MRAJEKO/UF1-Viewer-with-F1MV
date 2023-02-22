const debug = false;

const f1mvApi = require("npm_f1mv_api");

const { ipcRenderer } = require("electron");

let goveeConnected = false;
let goveeDevices = [];

const goveeEnabled = (async () => (await ipcRenderer.invoke("get_store")).config.flag_display.govee)();

async function goveeHandler() {
    if (goveeEnabled) {
        console.log(window);

        if (await ipcRenderer.invoke("checkGoveeWindowExistence")) return;

        const goveePanel = window.open(
            "govee/index.html",
            "_blank",
            `width=150,height=150,frame=false,transparent=true,hideMenuBar=true,hasShadow=false,alwaysOnTop=true`
        );

        const Govee = require("govee-lan-control");
        const govee = new Govee.default();

        govee.on("deviceAdded", async (device) => {
            console.log("Connected to Govee device: " + device.model);

            goveeDevices.push(device);

            goveePanel.document.getElementById("connected").textContent = goveeDevices.length;

            setGoveeLight("green");

            await sleep(1000);

            setGoveeLight("default");

            goveeConnected = true;
        });

        govee.on("deviceRemoved", async (device) => {
            console.log("Govee device disconnected: " + device.model);

            const deviceIndex = goveeDevices.indexOf(device);

            goveeDevices.splice(deviceIndex, 1);

            goveePanel.document.getElementById("connected").textContent = goveeDevices.length;

            if (goveeDevices.length === 0) goveeConnected = false;
        });
    }
}

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Set basic info
const flag = document.getElementById("flag");
const extra = document.getElementById("extra");
const chequered = document.getElementById("chequered");

async function getConfigurations() {
    const configfile = (await ipcRenderer.invoke("get_store")).config;
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

async function setGoveeLight(color) {
    const ledColors = (await ipcRenderer.invoke("get_store")).led_colors;
    const rgbColor = ledColors[color];

    console.log("Set govee light to: " + color);

    console.log(goveeDevices);
    for (const device of goveeDevices) {
        await device.actions.fadeColor({
            time: 500,
            color: {
                rgb: rgbColor,
            },
            brightness: 100,
        });
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
                if (goveeConnected) setGoveeLight("green");
                flag.classList.remove("red");
                flag.classList.remove("yellow");
                flag.classList.add("green");
                await sleep(5000);
                if (goveeConnected) setGoveeLight("default");
                flag.classList.remove("green");
                break;
            case 2:
                if (goveeConnected) setGoveeLight("yellow");
                flag.classList.add("yellow");
                break;
            case 4:
                await blink("yellow", 3, 500);
                if (goveeConnected) setGoveeLight("yellow");
                flag.classList.add("yellow");
                break;
            case 5:
                if (goveeConnected) setGoveeLight("red");
                flag.classList.remove("yellow");
                flag.classList.add("red");
                break;
            case 6:
            case 7:
                await blink("yellow", 3, 750);
                if (goveeConnected) setGoveeLight("yellow");
                flag.classList.add("yellow");
                break;
        }
    }

    const sessionStatus = data.SessionStatus.Status;
    if (sessionStatus === "Finished" && prevSessionStatus !== sessionStatus) {
        prevSessionStatus = sessionStatus;
        await finishBlink("white", 5, 1000);
        if (goveeConnected) setGoveeLight("default");
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
            if (goveeConnected) setGoveeLight("purple");
            extra.classList.add("fastest-lap");
            await sleep(3000);
            if (goveeConnected) setGoveeLight("default");
            extra.classList.remove("fastest-lap");
        }
    }
}

async function finishBlink(color, amount, interval) {
    for (let count = 0; count < amount; count++) {
        if (goveeConnected) setGoveeLight(color);
        chequered.classList.add(color);
        await sleep(interval);
        if (goveeConnected) setGoveeLight("black");
        chequered.classList.remove(color);
        await sleep(interval);
    }
}

async function blink(color, amount, interval) {
    for (let count = 0; count < amount; count++) {
        if (goveeConnected) setGoveeLight(color);
        flag.classList.add(color);
        await sleep(interval);
        if (goveeConnected) setGoveeLight("black");
        flag.classList.remove(color);
        await sleep(interval);
    }
}

async function run() {
    await goveeHandler();
    await getConfigurations();

    while (true) {
        await getCurrentStatus();
        await sleep(250);
    }
}

run();

// {"Status":"1","Message":"AllClear"}
// {"Status":"2","Message":"Yellow"}
// {Status: "3", Message: ""}
// {Status: "4", Message: "SCDeployed"}
// {"Status":"5","Message":"Red"}
// {"Status":"6","Message":"VSCDeployed"}
// {"Status":"7","Message":"VSCEnding"}
