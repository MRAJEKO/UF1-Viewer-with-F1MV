function toggleMoveMode() {
    document.getElementById("background").classList.toggle("drag");

    const infoElement = document.getElementById("move_mode_info");

    infoElement.style.display = infoElement.style.display === "none" ? "flex" : "none";
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        toggleMoveMode();
    }
});

document.getElementById(
    "background"
).innerHTML += `<div id="move_mode_info"><h1>Move Mode</h1><p>This window is currently in move mode. You can press 'Escape' to toggle it and switch between moving and functionality</p></div>;`;
