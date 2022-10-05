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

function addTimer(name) {
    let container = document.getElementById("container");
    console.log(container);
    let timer = `<div class="row">
        <section id="timer 1">
        <h1>${name}</h1>
        <p>00:00</p>
        </section>
    </div>`;
    container.innerHTML += timer;
}

addTimer("Timer 2");
addTimer("Timer 3");

rcms = JSON.parse(
    httpGet("http://localhost:10101/api/v1/live-timing/RaceControlMessages")
);

WANTED_CATEGORIES = ["Other", "SessionStartDelayed", "SessionResume"];
WANTED_KEYWORDS = ["MINUTES", ":"];

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
