const { spawn, exec } = require("child_process");

// Function called when the user clicks the button
function multiViewer() {
    const path = require("path");
    const location = path.join(__dirname, "../");
    let executablePath = "C:\\WINDOWS\\system32\\cmd.exe";

    spawn(executablePath, ["/c", "start", location + "MultiViewer/MV.cmd"], {
        detached: true,
    });
}

function flagDisplay() {
    window.open(
        "../FlagDisplay/fd.html",
        "_blank",
        "top=500,left=200,frame=false,nodeIntegration=no"
    );
}

function trackTime() {
    window.open(
        "../TrackTime/tt.html",
        "_blank",
        "height=100px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false,webPreferences={devTools=false},top=0,left=200,nodeIntegration=no"
    );
}
