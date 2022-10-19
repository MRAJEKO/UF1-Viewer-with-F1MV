const debug = true;

// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

let api;
let driverList;
let carData;
let driverName;
let teamColor;

function apiRequests() {
    api = JSON.parse(
        httpGet(
            "http://localhost:10101/api/v2/live-timing/state/DriverList,CarData"
        )
    );
    driverList = api.DriverList;
    carData = api.CarData;
    if (debug) {
        console.log("------------------------------");
        console.log("Driver list:");
        console.log(driverList);
        console.log("Car data:");
        console.log(carData);
    }
}

function numberToDriver(number) {
    driverName =
        driverList[number].FirstName +
        " " +
        driverList[number].LastName.toUpperCase();
    teamColor = driverList[number].TeamColour;
    if (debug) {
        console.log("------------------------------");
        console.log("Driver name: " + driverName);
        console.log("Team color hex: " + teamColor);
    }
}

apiRequests();
numberToDriver("5");
