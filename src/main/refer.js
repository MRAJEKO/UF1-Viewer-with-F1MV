const { spawn, exec } = require("child_process");
const fs = require("fs");

console.log(window.myAPI);

function launchMVF1() {
    let LOCALAPPDATA = process.env.LOCALAPPDATA;
    if (navigator.appVersion.indexOf("Win") != -1) {
        if (!fs.existsSync(`${LOCALAPPDATA}\\MultiViewerForF1`)) {
            alert(
                "Cannot run MultiViewer because of invalid path. Please put your MultiViewer folder under '%APPDATA%'"
            );
            return;
        }
        let mvPath = `${LOCALAPPDATA}\\MultiViewerForF1\\MultiViewer for F1.exe`;
        console.log("Launching MultiViewer");
        spawn(mvPath, [], { detached: true });
    } else if (navigator.appVersion.indexOf("Mac") != -1) {
        alert("Launching MultiViewer is not compatible with MacOS yet.");
        // if (!fs.existsSync(`/Applications/MultiViewer for F1.app`)) {
        //     alert(
        //         "Cannot run MultiViewer because of invalid path. Please put your MultiViewer folder under '/Applications'"
        //     );
        //     return;
        // }
        // let mvPath = `/Applications/MultiViewer for F1.app`;
        // console.log("Launching MultiViewer");
        // spawn(mvPath, [], { detached: true });
    } else if (navigator.appVersion.indexOf("X11") != -1) {
        alert("Launching MultiViewer is not compatible with Unix OS yet.");
    } else if (navigator.appVersion.indexOf("Linux") != -1) {
        alert("Launching MultiViewer is not compatible with Linux OS yet.");
    } else {
        {
            alert("Cannot run MultiViewer because OS is unknown.");
        }
    }
}

function flagDisplay() {
    window.open(
        "../flagdisplay/index.html",
        "_blank",
        "top=500,left=200,frame=false,nodeIntegration=no"
    );
}

function digiFlag() {
    window.open(
        "../digiFlag/index.html",
        "_blank",
        "title=DigiFlag,autoHideMenuBar=true"
    );
}

function trackTime() {
    window.open(
        "../tracktime/index.html",
        "_blank",
        "height=100px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false,nodeIntegration=no"
    );
}

function trackInfo() {
    window.open(
        "../trackinfo/index.html",
        "_blank",
        "height=800px,width=1400px,transparent=true,frame=false,resizable=true,hasShadow=false,contextIsolation=false,"
    );
}

function compass() {
    window.open(
        "../compass/index.html",
        "_blank",
        "height=100px,width=100px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function fastest() {
    window.open(
        "../fastest/index.html",
        "_blank",
        "height=300px,width=1000px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}
