import React from "react";
import { createRoot } from "react-dom/client";

import Graph from "./graph";

import "../../fonts/fonts.css";

import "../../styles/window_info.css";

import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <div>
        <Graph />
    </div>
);
