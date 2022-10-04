// Set sleep
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// URL output function
function httpGet(theUrl) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", theUrl, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
}

rcms = JSON.parse(
    httpGet("http://localhost:10101/api/v1/live-timing/RaceControlMessages")
);

WANTED_CATEGORIES = ["Other", "SessionStartDelayed", "SessionResume"];
WANTED_KEYWORDS = ["MINUTES", ":" ]


console.log(rcms);
for (i in rcms.Messages) {
    category = rcms.Messages[i].SubCategory;
    if (category == undefined) {
        category = rcms.Messages[i].OriginalCategory;
    }
    if (WANTED_CATEGORIES.includes(category)) {
        console.log(category);
    }
}
