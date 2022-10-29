const { spawn, exec } = require("child_process");

function launchMVF1() {
    var mvPath =
        "C:/Users/Aiden/AppData/Local/MultiViewerForF1/MultiViewer for F1.exe";
    console.log("Launching MultiViewer");
    spawn(mvPath, [], { detached: true });
}

function flagDisplay() {
    window.open(
        "../flagdisplay/index.html",
        "_blank",
        "top=500,left=200,frame=false,nodeIntegration=no"
    );
}

function trackTime() {
    window.open(
        "../tracktime/index.html",
        "_blank",
        "height=100px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false,nodeIntegration=no"
    );
}

function compass() {
    window.open(
        "../compass/index.html",
        "_blank",
        "height=100px,width=100px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function singleRCM() {
    let left = (window.screen.width - 1000) / 2;
    window.open(
        "../singlercm/index.html",
        "_blank",
        "top=0,left=" +
            left +
            ",alwaysOnTop=true,width=1000px,height=100px,frame=false,transparent=true,resizable=false,hasShadow=false,webPreferences={devTools=false}"
    );
}

function trackInfo() {
    window.open(
        "../trackinfo/index.html",
        "_blank",
        "height=800px,width=1400px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function improve() {
    window.open(
        "../improves/index.html",
        "_blank",
        "height=500px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function crashDetection() {
    window.open(
        "../crashDetection/index.html",
        "_blank",
        "height=400px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function fastest() {
    window.open(
        "../fastest/index.html",
        "_blank",
        "height=300px,width=1000px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}

function FP() {
    window.open(
        "../flagdisplay/index.html",
        "_blank",
        "fullscreen=true,frame=false,nodeIntegration=no"
    );
    window.open(
        "../fastest/index.html",
        "_blank",
        "height=251px,width=900px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
    window.open(
        "../trackinfo/index.html",
        "_blank",
        "height=650px,width=950px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
    window.open(
        "../crashDetection/index.html",
        "_blank",
        "height=400px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
    window.open(
        "../compass/index.html",
        "_blank",
        "height=80px,width=80px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
    window.open(
        "../tracktime/index.html",
        "_blank",
        "height=80px,width=400px,transparent=true,frame=false,resizable=true,hasShadow=false,nodeIntegration=no"
    );
    window.open(
        "../flagdisplay/index.html",
        "_blank",
        "height=100px,width=100px,frame=false,nodeIntegration=no"
    );
    window.open(
        "../flagdisplay/index.html",
        "_blank",
        "height=100px,width=100px,frame=false,nodeIntegration=no"
    );
    let left = (window.screen.width - 1000) / 2;
    window.open(
        "../singlercm/index.html",
        "_blank",
        "top=19,left=" +
            left +
            ",alwaysOnTop=true,width=1000px,height=100px,frame=false,transparent=true,resizable=false,hasShadow=false,webPreferences={devTools=false}"
    );
}
