from ast import Mult
from ensurepip import version
import json
import os
from time import sleep
import requests
import zipfile
import shutil
import subprocess

os.system('cls')

outputDir = "C:/Users/Aiden/OneDrive/F1/UF1/MVF1 Releases/"
MultiViewer = "C:/Users/Aiden/OneDrive/F1/UF1/MultiViewer for F1"

package = open(MultiViewer + "/resources/app/package.json")
currentVersion = "v" + json.load(package)["version"]
latest = requests.get("https://releases.f1mv.com/releases/latest").json()
package.close()
latestVersion = latest["name"]
filename = latestVersion + ".zip"
latestId = str(latest["assets"][0]["id"])


if currentVersion != latestVersion:
    def extractZip(src, dest):
        with zipfile.ZipFile(src, 'r') as zip_ref:
            zip_ref.extractall(dest)



    for asset in latest["assets"]:
        if ("win32" in asset["name"]):
            assetId = asset["id"]
            assetName = asset["name"]

            downloadURL = "https://releases.f1mv.com/download/" + str(assetId) + "/" + str(filename)
            
            print("Downloading file")
            with open(outputDir + filename, "wb") as f:
                f.write(requests.get(downloadURL).content)
            print("Extracting ZIP")
            extractZip(outputDir + filename, outputDir)

            os.remove(outputDir + filename)
            print("Renaming folder")
            os.rename(outputDir + "MultiViewer for F1-win32-x64",outputDir + latestVersion)
            break
    print("File had downloaded")

    print("Deleting old files")
    shutil.rmtree(MultiViewer)
    os.mkdir(MultiViewer)

    source_dir = outputDir + latestVersion
    target_dir = MultiViewer
        
    file_names = os.listdir(source_dir)
        
    print("Moving new files")
    for file_name in file_names:
        shutil.move(os.path.join(source_dir, file_name), target_dir)
    print("Running MultiViewer")
    sleep(1)
else:
    print("No new version has been released")
    print("Running MultiViewer")
    sleep(1)


# for file in folder:
#     filedata = open(file, 'rb').read()
#     newLocation = newpath
#     newFile = open(f'{newLocation}/{file}', 'wb').write(filedata)
