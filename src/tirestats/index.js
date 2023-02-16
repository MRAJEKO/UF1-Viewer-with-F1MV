const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") document.getElementById("background").classList.toggle("transparent");
});

async function getConfigurations() {
    const configFile = require("../settings/config.json").current;
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
};

const tireOrder = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];

const topLimit = 3;

async function getTireStats() {
    const api = await f1mvApi.LiveTimingAPIGraphQL(config, ["DriverList", "TimingAppData"]);
    const driverList = api.DriverList;
    const tireData = api.TimingAppData.Lines;
    for (const driver in tireData) {
        const driverTireData = tireData[driver].Stints;

        for (const stint of driverTireData) {
            const statsCompound = tireStats[stint.Compound];
            const statsCompoundTimes = statsCompound.toptimes;
            console.log(driver, statsCompound.laps, stint.TotalLaps, stint.StartLaps);
            statsCompound.laps += stint.TotalLaps - stint.StartLaps;
            if (stint.TyresNotChanged === "0") statsCompound.sets++;
            if (!stint.LapTime) continue;

            statsCompound.times.push(parseLapTime(stint.LapTime));

            console.log(statsCompound.laps);
            if (statsCompoundTimes.length < topLimit) {
                statsCompoundTimes.push({
                    driver: driver,
                    time: parseLapTime(stint.LapTime),
                });
            } else {
                statsCompoundTimes.sort((a, b) => a.time - b.time);
                for (let i = 0; i < topLimit; i++) {
                    if (statsCompoundTimes[i].time > parseLapTime(stint.LapTime)) {
                        statsCompoundTimes[i] = {
                            driver: driver,
                            time: parseLapTime(stint.LapTime),
                        };
                        break;
                    }
                }
            }
        }
    }
    for (const compound in tireStats) {
        const timeArray = tireStats[compound].toptimes;
        timeArray.sort((a, b) => a.time - b.time);
    }

    tireOrder.sort((a, b) => {
        const aTimeAverage =
            tireStats[a].times.reduce(function (accumulator, curValue) {
                return accumulator + curValue;
            }, 0) / tireStats[b].times.length;
        const bTimeAverage =
            tireStats[b].times.reduce(function (accumulator, curValue) {
                return accumulator + curValue;
            }, 0) / tireStats[b].times.length;
        if (aTimeAverage === bTimeAverage) return 0;
        if (aTimeAverage > bTimeAverage) return -1;
        return 1;
    });

    console.log(tireOrder);

    console.log(tireStats);
}

async function run() {
    await getConfigurations();
    await getTireStats();
}

run();
