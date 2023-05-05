<br />
<div align="center">
  <a href="https://github.com/MRAJEKO/UF1-Viewer-with-F1MV">
    <img src="src/icons/windows/logo.png" alt="Logo" width="200" height="200">
  </a>

<h2 align="center">Ultimate Formula 1 Viewer</h2>
    <h3>Using <a href="https://muvi.gg/">MultiViewer for F1</a></h3>

</div>
<br />
<br />
<br />

# Information

## What is Ultimate Formula 1 Viewer (UF1)?

This app is a integration on <a href="https://muvi.gg/">MultiViewer for F1</a>. It adds a lot of visuals and information windows using the MultiViewer API. It is mainly build for personal use but is now open source for everyone to use. The goal of is to make watching Formula 1 more enjoyable and easier to follow. The app is focused on showing information that really helps you understand what is going on the session. A lot of status information, changes in the session and automatic switching between the most important stuff happening on track.

> **Note:** This app requires <a href="https://muvi.gg/">MultiViewer for F1</a> to be installed.

<br>

# Installation

## Download

Open the latest release page and download the, for your OS compatible, version of UF1

> https://github.com/MRAJEKO/UF1-Viewer-with-F1MV/releases/latest

## Installation

Open the file you just downloaded and follow all the steps in the prompt. These windows will guide you through the installation process.

## Running

After the installation is complete you can run the application by opening the start menu and searching for '**Ultimate-F1Viewer-With-F1MV**' or by opening the folder where you installed it and opening the executable file.

<br>
<br>

# Usage

## Startup Window

When you first start the application you will be promted to open MultiViewer for F1 and start a (replay) live timing session. You can open MultiViewer by pressing the 'Open MultiViewer' button. To start a (replay) live timing you will need to select a session and start the (replay) live timing at the top. The status pills will change color to show you the status of the connection. If you open your MultiViewer the 'Not connected to MultiViewer' will turn green and show 'Connected to Multiviewer'. If you also launch a (replay) live timing the bottom one will turn green showing a live timing has been found and the window will automatically disappear.

> **Note:** You are also able to 'continue either way' but this can cause issues and bugs when opening windows. Use at your own risk.

<img style="border-radius: 10px;" src="https://test-cdn.lapstime.fr/u/m6Z5Ih.png" height="400">

<br>

## Main Window

The main window will be used as the hub for everything else. You are able to launch windows, change settings and choose layouts all from here. You are also able to launch certain windows from MultiViewer for ease of access. If the main window gets closed, all other windows will also close automatically making it very easy to quit.

### Launcher

> The main window is used as a launcher for all other windows. You can launch MultiViewer for F1 from here as well.

<img style="border-radius: 10px;" src="https://test-cdn.lapstime.fr/u/VbB8z6.png" height="600" />

<br />
<br />

### Settings

> There is also a settings window that can be opened by clicking the settings icon in the bottom right corner. It will show a section where you can change the settings of different windows. you can also change settings like network settings.

<img style="border-radius: 10px;" src="https://test-cdn.lapstime.fr/u/RWu5DA.png" height="400" />

<br />
<br />

---

<br>

## Layouts (main window)

You also have the ability to save layouts and load layouts.

### Adding a new layout

> To create a layout you must press the 'Add new layout' button. A empty layout will then be added.

### Saving a layout

> If you want to save the currently opened windows you can press the save icon to right of you newly added layout. If you have any MultiViewer streams open, these will also be saved.

### Editing the layout

> Pressing the pencil icon to the left will give you the ability to edit the layout. You can change the name of the layout by overwriting the text in the center. When you are done, you are able to press 'confirm' to save the changes or 'cancel' to discard the changes. Deleting the layout will also be possible by pressing the 'delete' button when editing.

### Loading a layout

> To load a layout you can press the name of the layout. This will open all the UF1 windows that are saved in the layout. If there currently is a live session it will also automatically load those correct stream and start the live timing. If this is not the case it will not open any MultiViewer Streams. You are also able to provide a 'contentId' to open a corresponding session which will also launch the correct MultiViewer streams **but not the correct live timing**.

<img style="border-radius: 10px;" src="https://test-cdn.lapstime.fr/u/hSF6DC.png" height="400" />

<br>

## **Important note**

For all windows with a gray background, when you press 'Escape' the window will become transparent making it look a lot better. For some windows such as 'Weather Information' or 'Battle mode' you must have it as a transparent window to have all its functionality. For some windows resizing and moving will only be possible when the are **not** transparent

<br>

## Multiviewer Windows

### **'MultiViewer'**

The MultiViewer button will open MultiViewer in the main tab. From there you will be able to select your requested live session or replay and launch it. You can also launch MultiViewer from the begin page.

> **Note:** Launching MultiViewer this way will use deeplinking through UF1. This means that MultiViewer is connected to UF1 and will automatically close when the UF1 main window is closed.

### **'Live Timing'**

Pressing this button will open the live timing page if there is a live session. This button will be grayed out if there is o live session.

> **Note:** Launching the live timing this way will use deeplinking through UF1. This means that the live timing page is connected to UF1 and will automatically close when the UF1 main window is closed.

<br>

## Ultimate Formula 1 Viewer (UF1) Windows

### **'Flag Display'**

Will show the current track status. It will blink yellow when a SC or a VSC is triggered and it will turn purple when a new fastest lap has been set. If the track is clear it will show a green flag for a few seconds and then return to a darkgray/black so you can use it as neutral background.

<img src="https://test-cdn.lapstime.fr/u/l1giQY.png" height="50">

<img src="https://test-cdn.lapstime.fr/u/dmM1Dl.png" height="50">

<br>

### **'Govee Lights'**

Shows how many govee lights are connected. The Govee integration is disabled by default and you will need to enable LAN Control for you lights in order for it to connect. (the lights are connected to the flag display window)

<img src="https://test-cdn.lapstime.fr/u/buoZIw.png" height="100">

<br>

### **'Delayed Track Time'**

Shows the current time on track in their timezone.

<img src="https://test-cdn.lapstime.fr/u/fVI5bf.png" height="100">

<br>

### **'Session Log'**

Shows a list of the past change of events in the session. Driver pit entry or exit, pit stop times and tire changes (race only), new fastest laps, new lap starts (race only), DRS changes, new team radio's (disabled by default), ect. A new bar will be generated if a event occurs.

<img src="https://test-cdn.lapstime.fr/u/6mzgrn.png" height="400">

<br>

### **'Track Information'**

Shows information about the track such as DRS being enabled, pit exit or entry being open, session timer, status of the session (whether the session is started), ect.

<img src="https://test-cdn.lapstime.fr/u/FBvTx7.png" width="100%">

<br>

### **'Sector Statuses'**

Shows the statuses of all mini sectors (segments) on track. It also shows whether the segment has a slippery surface or not.

<img src="https://test-cdn.lapstime.fr/u/jmWn7y.png" height="500">

<br>

### **'Single Race Control Message'**

Show new race control messages that are coming through. It will also show icons based on their type so you can quickly see the type and importance of the message. It will be shown for a few seconds and then disapear.

<img src="https://test-cdn.lapstime.fr/u/6yilqn.png" width="100%">

<br>

### **'Crash Detection'**

Will show cars that have crashed or need to retire based on the car driving slow or stopping.

<img src="https://test-cdn.lapstime.fr/u/we9BVy.png" height="200">

<br>

### **'Track Rotation Compass'**

Will point to the north of the track. This is the rotation relative to the MultiViewer track map than might be rotated. North might not be the top of the track but the direction where the compass points to.

<img src="https://test-cdn.lapstime.fr/u/0Exnwp.png" height="100">

<br>

### **'Tire Stats'**

Will show information about the used tires. It will show the top 3 times set using that tire, the total laps driven and sets used of that tire and it will also show the delta to the other tire compounds so you can see which on is the quickest.

<img src="https://test-cdn.lapstime.fr/u/v4ooAE.png" height="400">

<br>

### **'Current Laps'**

Shows all the drivers that are on a push lap. It shows the mini sectors and the sector times. It also shows information to a 'target' driver which is picked based on the session and position. This is most useful during a practice or qualifying session. It also sorts on order of the driver on track meaning the top one will finish their lap first and so forth.

<img src="https://test-cdn.lapstime.fr/u/jyRiuk.png" height="400">

<br>

### **'Battle Mode'**

Select drivers you want to see the gap between. The amount of driver you can select depents on the width of the window. It also shows telemetry and lap times per driver but that gets removed if it wouldn't fit all the selected driver.

<img src="https://test-cdn.lapstime.fr/u/8ie1sE.png" width="100%">

<br>

### **'Weather Information'**

It shows the track and air temperature over time and shows the current humidity and pressure. It also has the wind direction and wind speed plus if it is raining or not.

<img src="https://test-cdn.lapstime.fr/u/TEOdXy.png" width="100%">

<br>

### **'Auto Onboard Camera switcher'**

Will switch the onboards based on priority. This would be very useful if you can't open all the onboards but don't want to miss anything that is happening on track. It will take in account, pit stops, crashes, within DRS, catching and retirements to set the priority of the drivers. Then it will check how many onboards are show and it will make sure to put the (amount of opened OBC's) most important drivers on display. It will automatically be synced to the main feed meaning you don't need to do anything. You can also reduce the window for it to be less intrusive.

> **Important:** This will only work if you have the 'Auto Onboard Camera switcher' window on top. Minimizing or putting a different window on top of it will break the functionality.

> **Note:** You must select your main feed in the settings for it to sync without buffering. Default is the 'international' feed.

<img src="https://test-cdn.lapstime.fr/u/uIkTQz.png" height="300">

<img src="https://test-cdn.lapstime.fr/u/egwqCP.png" height="150">
