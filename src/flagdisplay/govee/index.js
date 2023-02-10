let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "";
        transparent = false;
    } else {
        document.querySelector("body").className = "transparent";
        transparent = true;
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleBackground();
    }
});
