const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

// Request the session info
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };
    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, "SessionInfo");
    sessionInfo = liveTimingState.SessionInfo;
}

async function rotate() {
    // Get the circuit key
    let circuitKey = sessionInfo.Meeting.Circuit.Key;

    // Get the current season
    let season = sessionInfo.StartDate.slice(0, 4);

    // Get the rotation of the track map according to the circuit key and current season
    let trackRotation = (await f1mvApi.getCircuitInfo(circuitKey, season)).rotation;

    // Set the track rotation to the compass image
    document.getElementById("compass").style.rotate = trackRotation + "deg";
}

// Check if 'escape' is being pressed to trigger 'toggleBackground'
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

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

async function run() {
    await getConfigurations();
    await apiRequests();
    await rotate();
}

run();
