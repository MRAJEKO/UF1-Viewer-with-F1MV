const { spawn, exec } = require("child_process");

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

function fastest() {
    window.open(
        "../fastest/index.html",
        "_blank",
        "height=300px,width=1000px,transparent=true,frame=false,resizable=true,hasShadow=false"
    );
}
