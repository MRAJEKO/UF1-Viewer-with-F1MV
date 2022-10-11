function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

let sessionInfo = JSON.parse(
    httpGet("http://localhost:10101/api/v1/live-timing/SessionInfo")
);

let circuitKey = sessionInfo.Meeting.Circuit.Key;

let season = sessionInfo.StartDate.slice(0, 4);

let circuit = JSON.parse(
    httpGet(`https://api.f1mv.com/api/v1/circuits/${circuitKey}/${season}`)
);

let trackSectors = circuit.marshalSectors;
for (i in trackSectors) {
    console.log(trackSectors[i].number);
}