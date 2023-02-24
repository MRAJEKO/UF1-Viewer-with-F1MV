const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

const tireStats = {
    SOFT: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
    MEDIUM: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
    HARD: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
    INTERMEDIATE: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
    WET: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
    TEST: {
        laps: 0,
        sets: 0,
        times: [],
        toptimes: [],
    },
};

const tireOrder = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET", "TEST"];

const topLimit = 3;

const tireLimit = 3;

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") document.getElementById("background").classList.toggle("transparent");
});

async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_store")).config;
    const networkConfig = configFile.network;
    const host = networkConfig.host;
    const port = (await f1mvApi.discoverF1MVInstances(host)).port;
    config = {
        host: host,
        port: port,
    };
}

function parseLapTime(time) {
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

function getLapTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    // const milliseconds = Math.floor((time - minutes * 60 - seconds) * 1000);

    const display0 = seconds < 10 ? "0" : "";

    return `${minutes}:${display0}${seconds.toFixed(3)}`;
}

async function apiRequests() {
    const api = await f1mvApi.LiveTimingAPIGraphQL(config, ["DriverList", "TimingAppData"]);
    tireData = api.TimingAppData?.Lines;
    driverList = api.DriverList;
}

let pastTireData = {};
function getTireStats() {
    for (const compound in tireStats) {
        tireStats[compound].laps = 0;
        tireStats[compound].sets = 0;
        tireStats[compound].times = [];
        tireStats[compound].toptimes = [];
    }

    for (const driver in tireData) {
        const driverTireData = tireData[driver].Stints;

        console.log(driver);

        for (const compound of tireOrder) {
            let compoundTime = null;
            for (const stint of driverTireData) {
                const driverCompound = stint.Compound === "TEST_UNKNOWN" ? "TEST" : stint.Compound;

                if (driverCompound !== compound) continue;

                // Set laps and sets
                tireStats[compound].laps += stint.TotalLaps - stint.StartLaps;
                if (stint.New === "true") tireStats[compound].sets++;

                const lapTime = stint.LapTime ? parseLapTime(stint.LapTime) : null;

                if (lapTime && (lapTime < compoundTime || compoundTime === null)) compoundTime = lapTime;
            }

            if (!compoundTime) continue;

            tireStats[compound].times.push(compoundTime);

            const compountStats = tireStats[compound];

            if (compountStats.toptimes.length < topLimit) {
                compountStats.toptimes.push({
                    driver: driver,
                    time: compoundTime,
                });
            } else {
                for (let count = 0; count < topLimit; count++) {
                    if (compountStats.toptimes[count].time > compoundTime) {
                        compountStats.toptimes[count] = {
                            driver: driver,
                            time: compoundTime,
                        };
                        break;
                    }
                }
            }

            tireStats[compound].toptimes.sort((a, b) => a.time - b.time);
        }
    }

    tireOrder.sort((a, b) => {
        const aTimeAverage =
            tireStats[a].times.reduce(function (aa, ab) {
                return aa + ab;
            }, 0) / tireStats[a].times.length;
        const bTimeAverage =
            tireStats[b].times.reduce(function (ba, bb) {
                return ba + bb;
            }, 0) / tireStats[b].times.length;
        if (aTimeAverage === bTimeAverage) return 0;
        if (aTimeAverage < bTimeAverage) return -1;
        if (isNaN(aTimeAverage)) return 1;
        if (isNaN(bTimeAverage)) return -1;
        return 1;
    });

    console.log(tireStats);
}

function setTireStats() {
    const compoundElements = document.getElementsByClassName("tire");

    for (let compoundIndex = 0; compoundIndex < tireLimit && compoundIndex < tireOrder.length; compoundIndex++) {
        const compound = tireOrder[compoundIndex];

        const compoundStats = tireStats[compound];

        const compoundElement = compoundElements[compoundIndex];

        // Set compount name and image
        const tireImageElement = compoundElement.querySelector(".tire-image");
        tireImageElement.children[0].src = `../icons/tires/${compound.toLowerCase()}_real.png`;
        tireImageElement.children[1].textContent = compound === "INTERMEDIATE" ? "INTERS" : compound;
        tireImageElement.children[1].className = compound.toLowerCase();

        // Set top times
        const topTimesElements = compoundElement.querySelectorAll(".top-times .row");
        for (const topTimeIndex in compoundStats.toptimes) {
            const topTime = compoundStats.toptimes[topTimeIndex];
            const topTimeElement = topTimesElements[topTimeIndex];

            // Set driver info
            const topDriverElement = topTimeElement.querySelector(".driver p");

            topDriverElement.textContent = driverList[topTime.driver].LastName;
            topDriverElement.style.color = "#" + driverList[topTime.driver].TeamColour;

            // Set time info
            const topTimeElementTime = topTimeElement.querySelector(".time p");
            topTimeElementTime.textContent = getLapTime(topTime.time);
        }

        // Set stats
        const statElements = compoundElement.querySelectorAll(".stats .row");

        statElements[0].children[1].textContent = compoundStats.laps;
        statElements[1].children[1].textContent = compoundStats.sets;

        // Set delta

        if (compoundStats.times.length === 0 || tireStats[tireOrder[0]].times.length === 0) continue;

        const fastestAverage =
            tireStats[tireOrder[0]].times.reduce((a, b) => a + b) / tireStats[tireOrder[0]].times.length;

        if (compoundIndex === 0) continue;

        const deltaTime = compoundElement.querySelector(".delta .delta-time p");

        const compoundTimeAverage = compoundStats.times.reduce((a, b) => a + b) / compoundStats.times.length;

        const delta = compoundTimeAverage - fastestAverage;

        deltaTime.textContent = `+${delta.toFixed(3)}`;
    }
}

async function run() {
    await getConfigurations();
    while (true) {
        await apiRequests();
        getTireStats();
        setTireStats();
        await sleep(5000);
    }
}

run();
