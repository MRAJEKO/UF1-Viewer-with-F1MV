const { parseLapOrSectorTime } = require("./times");

// Check if the driver is on a push lap or not
function isDriverOnPushLap(sessionStatus, trackStatus, timingData, bestTimes, sessionType, driverNumber) {
    if (sessionStatus === "Aborted" || sessionStatus === "Inactive" || [4, 5, 6, 7].includes(trackStatus)) return false;

    const driverTimingData = timingData[driverNumber];
    const driverBestTimes = bestTimes[driverNumber];

    if (sessionType === "Race" && (driverTimingData.NumberOfLaps === undefined || driverTimingData.NumberOfLaps <= 1))
        return false;

    if (driverTimingData.InPit) return false;

    // If the first mini sector time is status 2064, meaning he is on a out lap, return false
    if (driverTimingData.Sectors[0].Segments?.[0].Status === 2064) return false;

    // Get the threshold to which the sector time should be compared to the best personal sector time.
    const pushDeltaThreshold = sessionType === "Race" ? 0.2 : sessionType === "Qualifying" ? 1 : 3;

    const sectors = driverTimingData.Sectors;

    const lastSector = sectors.slice(-1)[0];

    if (sectors.slice(-1)[0].Value !== "" && (sectors.slice(-1)[0].Segments?.slice(-1)[0].Status !== 0 ?? true))
        return false;

    const completedFirstSector = sectors[0].Segments
        ? (sectors[0].Segments.slice(-1)[0].Status !== 0 && lastSector.Value === "") ||
          (lastSector.Segments.slice(-1)[0].Status === 0 &&
              lastSector.Value !== "" &&
              sectors[1].Segments[0].Status !== 0 &&
              sectors[0].Segments.slice(-1)[0].Status !== 0)
        : sectors[0].Value !== 0 && lastSector.Value === "";

    let isPushing = false;
    for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
        const sector = sectors[sectorIndex];
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        // Check if the first sector is completed by checking if the last segment of the first sector has a value meaning he has crossed the last point of that sector and the final sector time does not have a value. The last check is done because sometimes the segment already has a status but the times are not updated yet.

        // If the first sector time is above the threshold it should imidiately break because it will not be a push lap
        if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
            isPushing = false;
            break;
        }

        // If the first sector time is lower then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sectorTime - bestSectorTime <= pushDeltaThreshold && completedFirstSector) {
            isPushing = true;
            continue;
        }

        // If the driver has a fastest segment overall it would temporarily set pushing to true because the driver could have still backed out in a later stage
        if (sector.Segments?.some((segment) => segment.Status === 2051) && sessionType !== "Race") {
            isPushing = true;
            continue;
        }
    }

    // Return the final pushing state
    return isPushing;
}

// Get the position of the driver based on their segments
function getDriverPosition(driverNumber, timingData) {
    const driverTimingData = timingData[driverNumber];
    const sectors = driverTimingData.Sectors;

    // The starting segment will always be 0 because if there is no 0 state anywhere all segments will be completed and the current segment will be the first one.
    let currentSegment = -1;

    const driverCount = Object.keys(timingData).length;

    if (sectors[0].Segments) {
        for (const sectorIndex in sectors) {
            const segments = sectors[sectorIndex].Segments;
            for (const segmentIndex in segments) {
                const segment = segments[segmentIndex];
                if (segment.Status === 0) return parseInt(currentSegment) + parseInt(segmentIndex);
            }
            currentSegment += segments.length;
        }
    } else {
        currentSegment = driverCount - parseInt(driverTimingData.Position);
    }

    const lastSectorValue = sectors.slice(-1)[0].Value;

    if (lastSectorValue === "") return currentSegment;

    return 0;
}

function getDriversTrackOrder(timingData) {
    const driverOrder = Object.keys(timingData).sort((a, b) => {
        const positionDriverA = getDriverPosition(a, timingData);
        const positionDriverB = getDriverPosition(b, timingData);

        if (positionDriverA === positionDriverB) return timingData[a].Position - timingData[b].Position;

        return positionDriverB - positionDriverA;
    });

    return driverOrder;
}

function getRacingDriversPositionOrder(timingData) {

    var nodeConsole = require('console');
    var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

    let driverOrder = new Array(timingData.length).fill("");

    for (const driverNumber in timingData) {
        if (timingData[driverNumber].Stopped) { // "Stopped" seems to be more reliable than "Retired"
            continue;
        }
        driverOrder[parseInt(timingData[driverNumber].Position) - 1] = driverNumber;
    }
    
    driverOrder = driverOrder.filter(function(x) {
        return x !== ""; // remove stopped cars from the middle
    });

    return driverOrder;
}

module.exports = {
    isDriverOnPushLap,
    getDriverPosition,
    getDriversTrackOrder,
    getRacingDriversPositionOrder,
};
