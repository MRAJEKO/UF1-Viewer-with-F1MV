import React from "react";
import { createRoot } from "react-dom/client";

import Graph from "./graph";

import "../../fonts/fonts.css";

import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <div>
        <Graph />
    </div>
);

let transparent = false;
function toggleBackground() {
    if (transparent) {
        document.querySelector("body").className = "drag";
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
