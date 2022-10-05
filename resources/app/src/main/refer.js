const { spawn, exec } = require("child_process");

// Function called when the user clicks the button
function multiViewer() {
    console.log("Opening MultiViewer");

    var updater = spawn("python", ["./src/MultiViewer/mvAutoUpdater.py"]);


    // Used for debugging, can be removed
    updater.stdout.on("data", function (data) {
        console.log(data.toString());
    });
    updater.stderr.on("data", function (data) {
        console.log(data.toString());
    });
    updater.on("exit", function (code) {
        console.log("MultiViewer updater exited with code " + code.toString());
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

function countdowns() {
    window.open(
        "../countdowns/index.html",
        "_blank",
        "height=100px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false,webPreferences={devTools=false},top=0,left=200,nodeIntegration=no"
    );
}
