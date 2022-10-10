document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});

let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.getElementById("time").className = "";
        transparent = false;
    } else {
        document.getElementById("time").className = "transparent";
        transparent = true;
    }
}
