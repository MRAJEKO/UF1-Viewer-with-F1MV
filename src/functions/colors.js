// Set all statusses or names to the corect hex code
function getColorFromStatusCodeOrName(codeOrName) {
    switch (codeOrName) {
        case 2048:
            return "#fdd835";
        case 2049:
            return "#4caf50";
        case 2051:
            return "#9c27b0";
        case 2052:
            return "#f44336";
        case 2064:
            return "#2196f3";
        case 2068:
            return "#f44336";

        case "red":
            return "#f44336";
        case "yellow":
            return "#fdd835";
        case "green":
            return "#4caf50";
        case "purple":
            return "#9c27b0";
        case "white":
            return "#ffffff";

        case "S":
            return "#ff0000";
        case "M":
            return "#ffde00";
        case "H":
            return "#dbdada";
        case "I":
            return "#2c7515";
        case "W":
            return "#3d7ba3";

        case "ob":
            return "#9c27b0";
        case "pb":
            return "#4caf50";
        case "ni":
            return "#fdd835";

        default:
            return "#5b5b5d";
    }
}

// Convert the RBG values to hex
function rgbToHex(rgb) {
    // Extract the red, green, and blue components from the RGB value
    const [r, g, b] = rgb.match(/\d+/g).map((x) => parseInt(x, 10));

    // Convert the red, green, and blue values to hexadecimal
    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");

    // Return the hexadecimal color code
    return `#${hexR}${hexG}${hexB}`;
}

module.exports = {
    getColorFromStatusCodeOrName,
    rgbToHex,
};
