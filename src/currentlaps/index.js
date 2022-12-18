const debug = false;

const { ipcRenderer } = require("electron");

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function getConfigurations() {
    const config = (await ipcRenderer.invoke("get_config")).current.network;
    host = config.host;
    port = config.port;
    if (debug) {
        console.log(host);
        console.log(port);
    }
}

let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "";
        transparent = false;
    } else {
        document.querySelector("body").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

async function apiRequests() {
    const api = (
        await (
            await fetch(`http://${host}:${port}/api/graphql`, {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: `query LiveTimingState {
        liveTimingState {
            DriverList
            TimingAppData
            TimingData
            TimingStats
            SessionInfo
            TopThree
            SessionStatus
        }
    }`,
                    operationName: "LiveTimingState",
                }),
                method: "POST",
            })
        ).json()
    ).data.liveTimingState;
    driverList = api.DriverList;
    tireData = api.TimingAppData.Lines;
    timingData = api.TimingData.Lines;
    bestTimes = api.TimingStats.Lines;
    sessionInfo = api.SessionInfo;
    sessionType = sessionInfo.Type;
    topThree = api.TopThree.Lines;
    sessionStatus = api.SessionStatus.Status;
}

async function run() {
    await getConfigurations();
    await apiRequests();
    getAllPushDriverPositions();
}

function getAllPushDriverPositions() {
    Object.keys(timingData).some((driverNumber) => {
        const isDriverPushing = isDriverOnPushLap(driverNumber);

        // Temporary logs
        console.log(driverList[driverNumber].FullName);
        console.log(isDriverPushing);
    });
}

function parseLapOrSectorTime(time) {
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

function isDriverOnPushLap(driverNumber) {
    const driverTimingData = timingData[driverNumber];
    const driverBestTimes = bestTimes[driverNumber];

    if (driverTimingData.InPit) return false;

    if (driverTimingData.Sectors[0].Segments[0].Status === 2064) return false;

    const pushDeltaThreshold =
        sessionType === "Race" ? 0 : sessionType === "Qualifying" ? 1 : 3;

    return Object.keys(driverTimingData.Sectors).some((sectorIndex) => {
        const sector = driverTimingData.Sectors[sectorIndex];
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        if (sector.Segments.some((segment) => segment.Status === 2051))
            return true;

        const completedFirstSector = !driverTimingData.Sectors[0].Segments.some(
            (segment) => segment.Status === 0
        );

        if (
            sectorTime - bestSectorTime < pushDeltaThreshold &&
            completedFirstSector
        )
            return true;

        return false;
    });
}

run();

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// function isDriverOnPushLap(driverNumber) {
//     const driverTimingData = timingData[driverNumber];
//     const driverBestTimes = bestTimes[driverNumber];

//     const pushDeltaThreshold =
//         sessionInfo.Type == "Race"
//             ? 0
//             : sessionInfo.Type === "Qualifying"
//             ? 1
//             : 3;

//     return Object.keys(driverTimingData.Sectors).some((sectorIndex) => {
//         const sector = driverTimingData.Sectors[sectorIndex];
//         const bestSector = driverBestTimes.BestSectors[sectorIndex];

//         const sectorTime = parseLapOrSectorTime(sector.Value);
//         const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

//         // Driver hasn't completed the sector yet
//         if (sectorTime === 0) return false;

//         // Delta of current to best sector time is less than the push threshold
//         if (sectorTime - bestSectorTime < pushDeltaThreshold) return true;

//         // Driver set a new best sector time in this lap
//         const completedFirstSector = !driverTimingData.Sectors[0].Segments.some(
//             ({ status }) => status === 0
//         );
//         if (bestSector.Value === sector.Value && completedFirstSector)
//             return true;

//         // Consider lap a push lap if the driver set any overall best mini sectors
//         return sector.Segments.some((segment) => segment.Status === 2051);
//     });
// }

// function inPit(driver) {
//     if (
//         timingData[driver].Stopped ||
//         timingData[driver].InPit ||
//         timingData[driver].Retired
//     ) {
//         return true;
//     }
//     return false;
// }

// function slowLap(driver) {
//     if (
//         timingData[driver].PitOut ||
//         timingData[driver].Sectors[0].Segments[0].Status == 2064 ||
//         sessionStatus == "Aborted"
//     ) {
//         return true;
//     }
//     return false;
// }

// function difference(time) {
//     if (sessionInfo.Type == "Race") {
//         return time;
//     } else if (sessionInfo.Type == "Qualifying") {
//         return time + 1;
//     }
//     return time + 3;
// }

// function pushLap(driver) {
//     for (sector in timingData[driver].Sectors) {
//         let bestSector = +bestTimes[driver].BestSectors[sector].Value;
//         let currentSector = +timingData[driver].Sectors[sector].Value;
//         if (
//             difference(bestSector) > currentSector &&
//             currentSector != 0 &&
//             !timingData[driver].LastLapTime.PersonalFastest &&
//             timingData[driver].Sectors[0].Segments[
//                 +timingData[driver].Sectors[0].Segments.length - 1
//             ].Status != 0
//         ) {
//             return true;
//         }
//         for (segment in timingData[driver].Sectors[sector].Segments) {
//             let segmentStatus =
//                 timingData[driver].Sectors[sector].Segments[segment].Status;
//             if (
//                 segmentStatus == 2051 ||
//                 (bestSector == currentSector &&
//                     timingData[driver].Sectors[0].Segments[
//                         +timingData[driver].Sectors[0].Segments.length - 1
//                     ].Status != 0)
//             ) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

// function getPosition() {
//     loop1: for (timing in timingData) {
//         let segment = 0;
//         loop2: for (sector in timingData[timing].Sectors) {
//             let sectorLength =
//                 timingData[timing].Sectors[sector].Segments.length;
//             loop3: for (currentSegment in timingData[timing].Sectors[sector]
//                 .Segments) {
//                 if (
//                     timingData[timing].Sectors[sector].Segments[currentSegment]
//                         .Status == 0
//                 ) {
//                     segment += +currentSegment;

//                     driverStatusses[timing]["segment"] = segment + 1;
//                     break loop2;
//                 } else {
//                     driverStatusses[timing]["segment"] = 1;
//                 }
//             }
//             segment += +sectorLength;
//         }
//     }
// }

// function sortDriversOnPosition(statuses) {
//     let counter = trackSegmentCount;
//     let pushDriverOrder = [];
//     let slowDriverOrder = [];
//     while (counter != 0) {
//         for (i in statuses) {
//             if (statuses[i].segment == counter) {
//                 if (statuses[i].status == 0) {
//                     console.log(i);
//                     pushDriverOrder.push(i);
//                 }
//                 if (statuses[i].status == 1) {
//                     slowDriverOrder.push(i);
//                 }
//             }
//         }
//         counter--;
//     }
//     console.log(pushDriverOrder);
//     console.log(slowDriverOrder);
// }

// function getStatus() {
//     for (i in timingData) {
//         driverStatusses[i] = {};
//         if (inPit(i)) {
//             driverStatusses[i]["status"] = 2;
//             console.log(i + " is in pit");
//             continue;
//         }
//         if (slowLap(i)) {
//             driverStatusses[i]["status"] = 1;
//             console.log(i + " is on a slow lap");
//             continue;
//         }
//         if (pushLap(i)) {
//             driverStatusses[i]["status"] = 0;
//             console.log(i + " is on a push lap");
//             continue;
//         }
//         driverStatusses[i]["status"] = 1;
//         console.log(i + " is on a slow lap");
//     }
//     return driverStatusses;
// }

// let trackSegmentCount = 0;
// function getTrackSegmentCount() {
//     let firstTimingData = timingData[Object.keys(timingData)[0]];
//     for (i in firstTimingData.Sectors) {
//         trackSegmentCount += +firstTimingData.Sectors[i].Segments.length;
//     }
//     console.log(trackSegmentCount);
// }

// let driverStatusses = {};
// async function run() {
//     await getConfigurations();
//     await apiRequests();
//     getTrackSegmentCount();
//     // while (true)
//     getStatus();
//     getPosition();
//     sortDriversOnPosition(driverStatusses);
//     console.log(driverStatusses);
// }

// console.log("Run");
// run();
