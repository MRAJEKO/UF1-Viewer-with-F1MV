// Function to return the API request
function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

// Request the session info
let sessionInfo = JSON.parse(
    httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
);

// Get the circuit key
let circuitKey = sessionInfo.Meeting.Circuit.Key;

// Get the current season
let season = sessionInfo.StartDate.slice(0, 4);

// Get the rotation of the track map according to the circuit key and current season
let trackRotation = JSON.parse(
    httpGet(`https://api.f1mv.com/api/v1/circuits/${circuitKey}/${season}`)
).rotation;

// Set the track rotation to the compass image
document.getElementById("compass").style.rotate = trackRotation + "deg";

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
