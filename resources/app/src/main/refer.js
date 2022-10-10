const { spawn, exec } = require("child_process");
var fs = require("fs-extra");
const request = require("request");
var AdmZip = require("adm-zip");

async function getLatestDetails() {
    var latestInfo = await new Promise((resolve, reject) => {
        request(
            "https://releases.f1mv.com/releases/latest",
            { json: true },
            (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                resolve(body);
            }
        );
    });

    return latestInfo;
}

// Function called when the user clicks the button
async function multiViewer() {
    var path =
        "./src/MultiViewer/MultiViewer for F1/resources/app/package.json";
    var shouldDownload = false;
    try {
        var version = JSON.parse(fs.readFileSync(path)).version;
    } catch (err) {
        shouldDownload = true;
    }

    console.log("Current version: " + version);
    console.log(version);

    var latestInfo = await getLatestDetails();

    console.log("Current version: " + version);
    console.log("Latest version: " + latestInfo.name);
    shouldDownload =
        shouldDownload || version != latestInfo.name.replace("v", "");

    if (shouldDownload) {
        console.log("Downloading...");

        latestInfo["assets"].forEach((asset) => {
            if (asset.name.includes("win32")) {
                var assetId = asset["id"];
                var assetName = asset["name"];
                var filename = latestInfo.name + ".zip";
                var downloadUrl =
                    "https://releases.f1mv.com/download/" +
                    assetId +
                    "/" +
                    filename;
                console.log("Downloading " + downloadUrl);

                // Downloads new version
                request(downloadUrl)
                    .pipe(fs.createWriteStream(filename))
                    .on("close", function () {
                        console.log("Download complete");

                        console.log("Unzipping...");

                        var zip = new AdmZip(filename);
                        zip.extractAllTo(
                            "./src/MultiViewer/MVF1 Releases/",
                            true
                        );

                        console.log("Unzipping complete");

                        console.log("Deleting zip file...");

                        fs.remove(filename, (err) => {
                            if (err) return console.error(err);
                            console.log("Zip file deleted");
                        });

                        // Renames folder to add version number
                        var oldPath =
                            "./src/MultiViewer/MVF1 Releases/MultiViewer for F1-win32-x64";
                        var newPath =
                            "./src/MultiViewer/MVF1 Releases/" +
                            latestInfo.name;

                        if (fs.existsSync(newPath)) {
                            fs.rmdirSync(newPath, { recursive: true });
                        }

                        fs.rename(oldPath, newPath, function (err) {
                            if (err) throw err;
                            console.log("Renamed complete");

                            // copy folder to MultiViewer
                            var source = newPath;
                            var destination =
                                "./src/MultiViewer/MultiViewer for F1/";
                            // wipe destination folder
                            if (fs.existsSync(destination)) {
                                fs.rmdirSync(destination, { recursive: true });
                            }

                            // copy contents of source to destination
                            fs.mkdirSync(destination);
                            fs.copySync(source, destination);

                            launchMVF1();
                        });
                    });
            }
        });
    } else {
        console.log("Launching...");
        launchMVF1();
    }
}

function launchMVF1() {
    var mvPath = "./src/MultiViewer/MultiViewer for F1/MultiViewer for F1.exe";
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
    var left = (window.screen.width - 1000) / 2;
    console.log(left);
    window.open(
        "../SingleRCM/index.html",
        "_blank",
        "top=0,left=" +
            left +
            ",alwaysOnTop=true,width=1000px,height=100px,frame=false,transparent=true,resizable=false,hasShadow=false,webPreferences={devTools=false}"
    );
}
