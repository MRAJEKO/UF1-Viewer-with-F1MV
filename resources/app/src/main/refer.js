const { spawn, exec } = require("child_process");
var fs = require("fs-extra");
const request = require("request");
var AdmZip = require("adm-zip");

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
        "../TrackTime/index.html",
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
    var left = (window.screen.width - 1000) / 2;
    console.log(left);
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
