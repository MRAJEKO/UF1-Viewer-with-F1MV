const debug = false;

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") document.getElementById("background").classList.toggle("transparent");
});

async function getConfigurations() {
    const configFile = require("../settings/config.json").current;
    const networkConfig = configFile.network;
    const logConfig = configFile.session_log;
    const host = networkConfig.host;
    const port = (await f1mvApi.discoverF1MVInstances(host)).port;
    showLappedDrivers = logConfig.lapped_drivers;
    showRetiredDrivers = logConfig.retired_drivers;
    showRain = logConfig.rain;
    showTeamRadios = logConfig.team_radios;
    showPitstops = logConfig.pitstops;
    config = {
        host: host,
        port: port,
    };
}
