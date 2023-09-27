var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// Refresh interval
const loopspeed = 100;

const f1mvApi = require("npm_f1mv_api");

const { ipcRenderer } = require("electron");
const { getRacingDriversPositionOrder } = require("../functions/driver.js");

// Cached data, getting updated every cycle
let expectedLapTimeMs = 90000; // init to 90, but will be dynamically approximated
let driverLoopPos = NaN; // cached last positions on loop
let centerDriverId = NaN; // currently selected driver
let rectangles = {}; // references to rectangles drawn
let driverTrackOrder = NaN; // cached driver track order
let timeLostGreen = NaN; // time lost under green flag conditions
let timeLostVSC = NaN; // time lost under (V)SC conditions
let gapLeaderMs = {}; // cached gap to leader per driver, computed to solve lapped cars
let centerInfo = NaN; // info struct containing relevant info for displaying center data

// From settings
let pit_time_loss_default_green = NaN;
let pit_time_loss_default_vsc = NaN;
let pit_time_loss_always_default = NaN;
let circle_color = "#000000";
let center_text_color = "#FFFFFF";

// Apply any configuration from the config.json file
async function getConfigurations() {
    const configFile = (await ipcRenderer.invoke("get_store")).config;
    host = configFile.network.host;
    port = (await f1mvApi.discoverF1MVInstances(host)).port;

    pit_time_loss_always_default = configFile.circle_of_doom?.always_use_default;
    pit_time_loss_default_green = parseFloat(configFile.circle_of_doom?.default_pit_time_loss_green);
    pit_time_loss_default_vsc = parseFloat(configFile.circle_of_doom?.default_pit_time_loss_vsc);

    switch(configFile.circle_of_doom?.cod_circle_color) {
        case "BLACK":
            circle_color = "#000000";
            break;
        case "GREY":
            circle_color = "#777777";
            break;
        case "WHITE":
            circle_color = "#FFFFFF";
            break;
        default:
            circle_color = "#000000";
    }
    switch(configFile.circle_of_doom?.cod_center_text_color) {
        case "BLACK":
            center_text_color = "#000000";
            break;
        case "GREY":
            center_text_color = "#777777";
            break;
        case "WHITE":
            center_text_color = "#FFFFFF";
            break;
        default:
            center_text_color = "#FFFFFF";
    }
    
}

// ---- UTIL FUNCTIONS -----
function parseLapTime(time) {
    // Split the input into 3 variables by checking if there is a : or a . in the time. Then replace any starting 0's by nothing and convert them to numbers using parseInt.
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    return 1000 * (minutes * 60 + seconds) + milliseconds;
}

function mod(n, m) {
    return ((n % m) + m) % m;
}
function gapToAngleDegrees(gap) {
    let lapPerc = gap / expectedLapTimeMs;
    return lapPerc * 360.0;
}


// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// describing arc for SVG
function describeArc(x, y, radius, startAngle, endAngle) {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}

function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function vmin(percent) {
    return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
    return Math.max(vh(percent), vw(percent));
}

// All the api requests
async function apiRequests() {
    const config = {
        host: host,
        port: port,
    };

    const liveTimingClock = await f1mvApi.LiveTimingClockAPIGraphQL(config, ["trackTime", "systemTime", "paused"]);
    const liveTimingState = await f1mvApi.LiveTimingAPIGraphQL(config, [
        "DriverList",
        "TimingAppData",
        "TimingData",
        "TimingStats",
        "TrackStatus",
        "SessionInfo",
        "TopThree",
        "SessionStatus",
        "SessionData",
    ]);

    driverList = liveTimingState.DriverList;
    tireData = liveTimingState.TimingAppData?.Lines;
    timingData = liveTimingState.TimingData?.Lines;
    qualiTimingData = liveTimingState.TimingData;
    bestTimes = liveTimingState.TimingStats?.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    topThree = liveTimingState.TopThree?.Lines;
    sessionStatus = liveTimingState.SessionStatus?.Status;
    sessionData = liveTimingState.SessionData;
    trackStatus = parseInt(liveTimingState.TrackStatus?.Status);

    clockData = liveTimingClock;
}

// Need an estimated lap time to approximate position of leader on track.
// We do not use mini sectors since there is no timing for them. That would become too complicated.
// We use sectors here to adapt estimated lap time more quickly to VSC/weather etc.
function updateLapTimeEstimate() {
    // Simple heuristic: Take the fastest last lap of the top 5 to avoid in/out laps.
    let numLapTimes = Math.min(driverTrackOrder.length, 5);
    let lapTimes = []
    for (let i = 0; i < numLapTimes; i++) {
        let lapTimeMs = parseLapTime(timingData[driverTrackOrder[i]].LastLapTime.Value);

        // Last Lap Time is NaN until start of Lap 3. Sum up sectors instead, so we have a quicker estimate, and faster adapt to SC/VSC scenarios
        let dSecs = timingData[driverTrackOrder[i]].Sectors;
        let sumOfSecs = parseFloat(dSecs[0].PreviousValue) + parseFloat(dSecs[1].PreviousValue) + parseFloat(dSecs[2].PreviousValue);

        if (isNaN(sumOfSecs)) {
            // Not all sectors have a time 
            continue; 
        }
        lapTimeMs = 1000.0 * sumOfSecs;
        lapTimes.push(lapTimeMs);
    }

    if (lapTimes.length == 0) // no lap times, dont update.
        return;
        
    let bestLapTime = Math.min.apply(Math, lapTimes); 
    expectedLapTimeMs = bestLapTime;

}

// only works reliably with leader because we infer time when a lap first began according to sessionData
function getLeaderPosOnCircle(driverNr) {

    if (sessionStatus === "Inactive" || sessionStatus === "Aborted") return gapToAngleDegrees(0); // not running, put on top

    // get local time info
    const trackTime = clockData.trackTime;
    const systemTime = clockData.systemTime;
    const now = Date.now();
    const localTime = parseInt(clockData.paused ? trackTime : now - (systemTime - trackTime));

    // get "age" of current lap (where is leader?)
    // Lap 1 active WAY before race start. Only reliable for Lap >=2
    let currentLap = sessionData.Series.slice(-1)[0];
    let utcStartOfLap = NaN;

    if (currentLap.Lap == 1) {
        // Infer starting time from the session status
        // started at last status series event with "Started"
        let raceStartingTime = "";
        let k = sessionData.StatusSeries.length - 1;
        while (k >= 0) {
            if (("SessionStatus" in sessionData.StatusSeries[k]) && sessionData.StatusSeries[k].SessionStatus === "Started") {
                // starting time of the race
                raceStartingTime = sessionData.StatusSeries[k].Utc;
                break;
            }
            k = k - 1;
        }
        utcStartOfLap = raceStartingTime

    } else {
        utcStartOfLap = currentLap.Utc; 
    }

    let currentLapStartDateTime = new Date(utcStartOfLap);
    let currentLapStartDateTimeMs = currentLapStartDateTime.getTime();
    let lapTimeAgeMs = localTime - currentLapStartDateTimeMs - gapLeaderMs[driverNr]; // Age of lap, current lap time of leader

    return gapToAngleDegrees(lapTimeAgeMs);
}

// Need compute function to resolve lapped drivers. Their gap will be 1 LAP, we infer gap in seconds from intervals then.
function updateGapsToLeader() {
    // who is leading?
    const leaderCar = driverTrackOrder[0];

    // delete keys from leader struct if they are no longer in the race
    for (const key in gapLeaderMs) {
        if (!driverTrackOrder.includes(key)) {
            delete gapLeaderMs[key];
        } 
    }

    gapLeaderMs[leaderCar] = 0.0;
    let aheadDriverGapToLeader = 0.0;

    for (let i = 1; i < driverTrackOrder.length; i++) {
        let driverNumber = driverTrackOrder[i];

        const driverTimingData = timingData[driverNumber];

        // catch lapped drivers, otherwise the laps are getting parsed
        let currentDriverGapToLeaderMs = driverTimingData.GapToLeader.endsWith("L") ? NaN : 1000.0 * parseFloat(driverTimingData.GapToLeader);
        let currentDriverGapAheadMs = driverTimingData.IntervalToPositionAhead.Value.endsWith("L") ? NaN : 1000.0 * parseFloat(driverTimingData.IntervalToPositionAhead.Value);

        if (!isNaN(currentDriverGapToLeaderMs)) {
            // not lapped
            gapLeaderMs[driverNumber] = currentDriverGapToLeaderMs;
            aheadDriverGapToLeader = gapLeaderMs[driverNumber];
        } else if (!isNaN(currentDriverGapAheadMs)) {
            // atleast driver ahead is not >1L ahead, can infer
            gapLeaderMs[driverNumber] = aheadDriverGapToLeader + currentDriverGapAheadMs;
            aheadDriverGapToLeader = gapLeaderMs[driverNumber];

        } else if (driverTimingData.InPit) {
            // no timing available if driver is in pit
            // just freeze last valid gap
            gapLeaderMs[driverNumber] = gapLeaderMs[driverNumber];
            aheadDriverGapToLeader = gapLeaderMs[driverNumber];

        } else if (driverTimingData.GapToLeader == "") {
            // Empty filed, means no racing going on (yet), put on SF line
            gapLeaderMs[driverNumber] = 0.0;
            aheadDriverGapToLeader = gapLeaderMs[driverNumber];

        } else {
            // even car ahead is +1 LAP, no way from static API getting gap... just say 2 minutes, dunno
            // Pit Out Window doesnt matter anyways then, wont lose a spot when pitting.
            gapLeaderMs[driverNumber] = aheadDriverGapToLeader + 1000.0 * 120;
            aheadDriverGapToLeader = gapLeaderMs[driverNumber];

        }
    }
    
}


// update struct where angles on loop for each driver are saved.
function updateDriverPositionsOnLoopStruct() {
    // Empty it. 
    driverLoopPos = [];

    // Leader seperated, is always first in list.
    let leaderDriverNumber = driverTrackOrder[0];
    
    let leaderCirclePosDegrees = getLeaderPosOnCircle(leaderDriverNumber);
    driverLoopPos.push({
        driver: leaderDriverNumber,
        gapToLeader: gapLeaderMs[leaderDriverNumber],
        degrees: leaderCirclePosDegrees,
        isInPit: timingData[leaderDriverNumber].InPit
    });

    let driverStructAhead = driverLoopPos[0];

    for (const driverNr of driverTrackOrder) {
        if (driverNr === leaderDriverNumber) {
            continue;
        }

        // GAP is behind leader, not behind first car with valid timing!
        let driverGap = gapLeaderMs[driverNr];

        // for all, get from gap to leader the angle behind
        let degreesBehindLeader = gapToAngleDegrees(driverGap); // can be >360 if lapped
        let driverCirclePosDegrees = mod(leaderCirclePosDegrees - degreesBehindLeader, 360.0);

        // After pitting PitOut is true for super long (half a lap or so).
        // Check whether we have an interval ahead as reference whether driver is in pit.
        let driverIsInPit = timingData[driverNr].InPit || (timingData[driverNr].PitOut && timingData[driverNr].IntervalToPositionAhead.Value == "");
        // Still, sometimes a driver gets already a interval while driver ahead does not. Put them on top of each other.
        if (driverGap >= driverStructAhead.gapToLeader) {
            driverLoopPos.push({
                driver: driverNr,
                gapToLeader: driverGap,
                degrees: driverCirclePosDegrees,
                isInPit: driverIsInPit
            });

        } else {
            driverLoopPos.push({
                driver: driverNr,
                gapToLeader: driverStructAhead.gapToLeader,
                degrees: driverStructAhead.degrees,
                isInPit: driverIsInPit
            });
        }
        driverStructAhead = driverLoopPos[driverLoopPos.length - 1];
    }

}

function collectSelectedDriverInfo() {
    if (isNaN(centerDriverId)) {
        // no driver selected, keep empty
        centerInfo = NaN;
        return;
    }

    centerInfo = {}; // Empty it
    centerInfo['driverNumber'] = centerDriverId;
    centerInfo['driverShortName'] = driverList[centerDriverId].Tla;
    centerInfo['driverPosition'] = parseInt(timingData[centerDriverId].Position); // 1 ...

    // racing driver ahead position and number and gap
    centerInfo['driverAheadPosition'] = centerInfo['driverPosition'] - 1; // 1 ...
    centerInfo['driverAheadNumber'] = centerInfo['driverAheadPosition'] ? driverTrackOrder[centerInfo['driverAheadPosition'] - 1] : NaN; // 1st? ahead NaN
    centerInfo['driverAheadGap'] = isNaN(centerInfo['driverAheadNumber']) ? "" : timingData[centerDriverId].IntervalToPositionAhead.Value;

    // racing driver behind position and number and gap
    centerInfo['driverBehindPosition'] = centerInfo['driverPosition'] + 1; // 1 ... 
    centerInfo['driverBehindNumber'] = (centerInfo['driverBehindPosition'] <= driverTrackOrder.length) ? driverTrackOrder[centerInfo['driverBehindPosition'] - 1] : NaN;
    centerInfo['driverBehindGap'] = isNaN(centerInfo['driverBehindNumber']) ? "" : timingData[centerInfo['driverBehindNumber']].IntervalToPositionAhead.Value;

    // Pit Out Ranges
    let gapToLeaderMs = gapLeaderMs[centerDriverId];
    centerInfo['isVSCconditions'] = (parseInt(trackStatus) >= 4); // SC or VSC === TRUE
    centerInfo['isInPit'] = timingData[centerDriverId].InPit;
    centerInfo['isInPitOut'] = timingData[centerDriverId].PitOut;

    let pitExitBehindLeaderGreenMinMs = gapToLeaderMs + timeLostGreen * 1000.0 - 1000; // best case: loses 1s less than exp.
    let pitExitBehindLeaderGreenMaxMs = gapToLeaderMs + timeLostGreen * 1000.0 + 2000; // worst case: loses 2s more than exp.
    let pitExitBehindLeaderVscMinMs = gapToLeaderMs + timeLostVSC * 1000.0 - 1000; // best case: loses 1s less than exp.
    let pitExitBehindLeaderVscMaxMs = gapToLeaderMs + timeLostVSC * 1000.0 + 2000; // worst case: loses 2s more than exp.

    let pitExitPosGreenFront = 0;
    let pitExitPosGreenBack = 0;
    let pitExitPosVscFront = 0;
    let pitExitPosVscBack = 0;
    // see where they slot in
    for (let pos = 1; pos < driverTrackOrder.length; pos++) {
        if (!pitExitPosVscFront && gapLeaderMs[driverTrackOrder[pos]] > pitExitBehindLeaderVscMinMs) {
            pitExitPosVscFront = pos;
        }
        if (!pitExitPosVscBack && gapLeaderMs[driverTrackOrder[pos]] > pitExitBehindLeaderVscMaxMs) {
            pitExitPosVscBack = pos;
        }
        if (!pitExitPosGreenFront && gapLeaderMs[driverTrackOrder[pos]] > pitExitBehindLeaderGreenMinMs) {
            pitExitPosGreenFront = pos;
        }
        if (!pitExitPosGreenBack && gapLeaderMs[driverTrackOrder[pos]] > pitExitBehindLeaderGreenMaxMs) {
            pitExitPosGreenBack = pos;
            break; // will be the last thing happening
        }
    }

    // if still not set -> would be last
    pitExitPosGreenFront = pitExitPosGreenFront ? pitExitPosGreenFront : driverTrackOrder.length;
    pitExitPosGreenBack = pitExitPosGreenBack ? pitExitPosGreenBack : driverTrackOrder.length;
    pitExitPosVscFront = pitExitPosVscFront ? pitExitPosVscFront : driverTrackOrder.length;
    pitExitPosVscBack = pitExitPosVscBack ? pitExitPosVscBack : driverTrackOrder.length;

    // all relative to race leader
    centerInfo['predictedPitOutGapRangeGreen'] = [pitExitBehindLeaderGreenMinMs, pitExitBehindLeaderGreenMaxMs];
    centerInfo['predictedPitOutGapRangeVSC'] = [pitExitBehindLeaderVscMinMs, pitExitBehindLeaderVscMaxMs];

    centerInfo['predictedPitOutPosRangeGreen'] = [pitExitPosGreenFront, pitExitPosGreenBack];
    centerInfo['predictedPitOutPosRangeVSC'] = [pitExitPosVscFront, pitExitPosVscBack];

}

function updateCenterInfoDisplay() {
    var cdn = document.getElementById("centerDriverName");
    var cdgA = document.getElementById("centerDriverGapNamesAhead");
    var cdgB = document.getElementById("centerDriverGapNamesBehind");
    var cdgtA = document.getElementById("centerDriverGapTimesAhead");
    var cdgtB = document.getElementById("centerDriverGapTimesBehind");
    var cdpGreen = document.getElementById("centerDriverPitOutGreen");
    var cdpVSC = document.getElementById("centerDriverPitOutVSC");

    if (isNaN(centerDriverId)) {
        // Empty, no driver selected.
        cdn.innerHTML = "";
        cdgA.innerHTML = "";
        cdgB.innerHTML = "";
        cdgtA.innerHTML = "";
        cdgtB.innerHTML = "";
        cdpGreen.innerHTML = "";
        cdpVSC.innerHTML = "";
        return;
    }

    // GAPS
    let gapAhead = centerInfo['driverAheadGap'];
    if (gapAhead.startsWith("+")) {
        gapAhead = "-" + gapAhead.substring(1);
    }
    let gapBehind = centerInfo['driverBehindGap'];

    // fill HTML stuff
    cdn.innerHTML = centerInfo['driverShortName'];
    if (centerInfo['isInPit']) {
        cdn.innerHTML += " (PIT)";
        cdn.style.color = "#FF0000";
    } else {
        cdn.style.color = center_text_color;
    }
    // centerInfo['isInPitOut'] seems to be longer 'True' than actual pit out display

    cdgA.innerHTML = (isNaN(centerInfo['driverAheadNumber']) ? "" : (driverList[centerInfo['driverAheadNumber']].Tla + " " + centerInfo['driverAheadPosition'] + " <"));
    cdgB.innerHTML = (isNaN(centerInfo['driverBehindNumber']) ? "" : ("> " + centerInfo['driverBehindPosition'] + " " + driverList[centerInfo['driverBehindNumber']].Tla));

    cdgtA.innerHTML = gapAhead;
    cdgtB.innerHTML = gapBehind;

    let pitOutPosRange = (centerInfo['predictedPitOutPosRangeGreen'][0] == centerInfo['predictedPitOutPosRangeGreen'][1])
        ? centerInfo['predictedPitOutPosRangeGreen'][0]
        : centerInfo['predictedPitOutPosRangeGreen'].join('-');

    let pitOutPosRangeVSC = (centerInfo['predictedPitOutPosRangeVSC'][0] == centerInfo['predictedPitOutPosRangeVSC'][1])
        ? centerInfo['predictedPitOutPosRangeVSC'][0]
        : centerInfo['predictedPitOutPosRangeVSC'].join('-');

    cdpGreen.innerHTML = "Out: " + pitOutPosRange;
    cdpVSC.innerHTML = "VSC: " + pitOutPosRangeVSC;

}

function rectangleClicked(driver) {
    // Handle the click event here
    const clickedRectangle = document.getElementById("cod-" + driver);
    let clickedDriver = clickedRectangle.id.substring(4);

    if (centerDriverId != clickedDriver) {
        centerDriverId = clickedDriver;
    } else {
        // clicked active driver again, deselect
        centerDriverId = NaN;
    }

    collectSelectedDriverInfo();
    updateCenterInfoDisplay();
}

// Function to create and position rectangles
function createRectangles() {
    const ring = document.querySelector('.cod-ring');
    const ringRadius = parseFloat(getComputedStyle(ring).getPropertyValue('r'));

    const container = document.querySelector('.container');
    // Remove all elements with the 'rectangle' class
    var existingRectangles = document.querySelectorAll('.rectangle');

    existingRectangles.forEach(function (rectangle) {
        container.removeChild(rectangle);
    });
    var driverLabels = document.querySelectorAll('.driver-label');
    driverLabels.forEach(function (dl) {
        container.removeChild(dl);
    });

    // start finish line
    rectangles["SF"] = document.createElement('div');
    rectangles["SF"].className = 'button rectangle';
    rectangles["SF"].id = 'cod-SF';
    rectangles["SF"].style.transform = `translate(-50%, -50%) translate(0px, -${ringRadius}px) rotate(90deg)`;
    rectangles["SF"].style.backgroundColor = "#777777";
    container.appendChild(rectangles["SF"]);

    driverLoopPos.forEach(function (loopPos) {
        
        // loopPos.driver loopPos.gapToLeader/1000.0 loopPos.degrees
        const teamColor = driverList[loopPos.driver].TeamColour;
        rectangles[loopPos.driver] = document.createElement('div');

        rectangles[loopPos.driver].className = 'button rectangle';
        rectangles[loopPos.driver].id = 'cod-' + loopPos.driver;

        if (isNaN(loopPos.degrees)) {
            myConsole.log("Degrees is NaN, skip");
        }
        let displayDegrees = 0;
        // degrees -> 0 if in pit
        if (!loopPos.isInPit) {
            displayDegrees = loopPos.degrees;
        }

        // Calculate position and rotation for each 
        const rectPos = polarToCartesian(0, 0, ringRadius, displayDegrees);
        const rectRotation = displayDegrees + 90.0;

        // Apply the position and rotation as inline styles
        rectangles[loopPos.driver].style.transform = `translate(-50%, -50%) translate(${rectPos.x}px, ${rectPos.y}px) rotate(${rectRotation}deg)`;
        rectangles[loopPos.driver].style.backgroundColor = "#" + teamColor;
        if (!isNaN(centerDriverId) && centerDriverId == loopPos.driver) {
            // currently selected driver, give him a border
            rectangles[loopPos.driver].style.border = "5px solid green";
        }

        // Add a click event listener to each rectangle
        rectangles[loopPos.driver].onmousedown = () => rectangleClicked(loopPos.driver);
        container.appendChild(rectangles[loopPos.driver]);

        // create driver label
        const driverLabel = document.createElement('div');

        const xLabel = polarToCartesian(0, 0, 0.75 * ringRadius, displayDegrees).x;
        const yLabel = polarToCartesian(0, 0, 0.8 * ringRadius, displayDegrees).y;

        driverLabel.id = 'cod-label-' + loopPos.driver;
        driverLabel.className = 'driver-label';
        driverLabel.style.transform = `translate(-50%, -50%) translate(${xLabel}px, ${yLabel}px)`; //   
        driverLabel.style.color = "#" + teamColor;
        driverLabel.innerHTML = driverList[loopPos.driver].Tla;
        driverLabel.onmousedown = () => rectangleClicked(loopPos.driver);

        container.appendChild(driverLabel);

    });

    // add segment for predicted pit exit
    let arcG = document.getElementById("green-pit-out-arc");
    let arcVSC = document.getElementById("vsc-pit-out-arc");
    if (!isNaN(centerDriverId)) {
        // get degree range for pit exit. leader and gap
        let greenStartAngle = driverLoopPos[0].degrees - gapToAngleDegrees(centerInfo['predictedPitOutGapRangeGreen'][1]);
        let greenEndAngle = driverLoopPos[0].degrees - gapToAngleDegrees(centerInfo['predictedPitOutGapRangeGreen'][0]);
        let vscStartAngle = driverLoopPos[0].degrees - gapToAngleDegrees(centerInfo['predictedPitOutGapRangeVSC'][1]);
        let vscEndAngle = driverLoopPos[0].degrees - gapToAngleDegrees(centerInfo['predictedPitOutGapRangeVSC'][0]);
    
        // set green arc (cx,cy,r,startDeg,endDeg)
        arcG.setAttribute("d", describeArc(vw(50), vh(50), vmin(40), greenStartAngle, greenEndAngle));
        arcVSC.setAttribute("d", describeArc(vw(50), vh(50), vmin(40), vscStartAngle, vscEndAngle));
    } else {
        // deselected driver
        arcG.removeAttribute("d");
        arcVSC.removeAttribute("d");
    }

}

async function mainLoop() {

    if (sessionInfo.Type !== "Race") {
        // Not possible outside races.
        document.getElementById(
            "cod-info"
        ).innerHTML = `<h1>No race detected</h1><p>Circle of Doom is only supported during races. During other sessions, consult the driver tracker.</p>`;
        
        return;
    }
    // myConsole.log("TICK");

    if (sessionStatus === "Finalised" || sessionStatus === "Ends") 
        return; // Race over.

    await apiRequests();
    // update get current driver order
    driverTrackOrder = getRacingDriversPositionOrder(timingData);
    // myConsole.log(driverTrackOrder);
    // update lap time estimate
    updateLapTimeEstimate();
    // myConsole.log(expectedLapTimeMs);
    // update gaps for all drivers to leader
    updateGapsToLeader();
    // myConsole.log(gapLeaderMs);
    // update loop position data
    updateDriverPositionsOnLoopStruct();
    // collect data for center display
    collectSelectedDriverInfo();

    // create rectangles and segments
    createRectangles();
    // create center display
    updateCenterInfoDisplay();

}


// Run all function and create a loop to refresh
async function run() {

    await getConfigurations();
    await apiRequests();

    const circuitId = sessionInfo.Meeting.Circuit.Key;
    let season = sessionInfo.StartDate.slice(0, 4);
    
    // check for expected lap time to start with
    let candidateLapTime = parseFloat((await f1mvApi.getCircuitInfo(circuitId, season)).candidateLap?.lapTime) ?? NaN;
    if (!isNaN(candidateLapTime)) {
        expectedLapTimeMs = candidateLapTime * 1000.0;
    }

    // Check for time loss info from times.js
    // data there and not NaN? also check settings file.
    if (!pit_time_loss_always_default && (circuitId in boxLostTimesGreenVSC) && !isNaN(boxLostTimesGreenVSC[circuitId][0])) {

        timeLostGreen = parseFloat(boxLostTimesGreenVSC[circuitId][0]);
        timeLostVSC = parseFloat(boxLostTimesGreenVSC[circuitId][1]);
    } else if (pit_time_loss_always_default) {
        myConsole.log("Falling back to default time loss values because of settings...");
        timeLostGreen = pit_time_loss_default_green;
        timeLostVSC = pit_time_loss_default_vsc;
    } else if (circuitId in boxLostTimesGreenVSC) {
        // data there, but NaN
        myConsole.log("No times available for this circuit yet. Using defaults...");
        timeLostGreen = pit_time_loss_default_green;
        timeLostVSC = pit_time_loss_default_vsc;
    } else {
        myConsole.log("Unknown track, I don't know pit loss times. Using defaults...");
        timeLostGreen = pit_time_loss_default_green;
        timeLostVSC = pit_time_loss_default_vsc;
    }

    if (isNaN(timeLostGreen)) {
        myConsole.log("Settings fallback not parsable, setting GREEN loss to 21s.");
        timeLostGreen = 21.0;
    }
    if (isNaN(timeLostVSC)) {
        myConsole.log("Settings fallback not parsable, setting VSC loss to 15s.");
        timeLostVSC = 15.0;
    }

    // Update visuals depending on settings
    document.getElementById("ring").style.stroke = circle_color;
    document.getElementById("centerDriverInfo").style.color = center_text_color;

    mainLoop();
    setInterval(mainLoop, loopspeed);

    // Add a resize event listener to recreate rectangles when the window is resized
    window.addEventListener('resize', createRectangles);

}

run();