import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBullet } from "@nivo/bullet";

import { modifyData } from "./modifyData";

const { ipcRenderer } = require("electron");

const f1mvApi = require("npm_f1mv_api");

const colors = ["#1E90FF", "#FF4500"];

const infoColors = ["#FF5349", "#87CEFA", "#FF5349"];

const measureColors = ["#1E90FF"];

const maxColor = ["#FF4500"];

let host;
let port;

const intervalTime = 10000;

let limit = 30;
let defaultLimit = 30;

const CustomTooltip = ({ point }) => (
    <div style={{ background: "white", padding: "10px", borderRadius: "20px " }}>
        <strong>{point.serieId}</strong>
        <br />
        <strong>{point.data.xFormatted}</strong> - {String(point.data.yFormatted)}°C
    </div>
);

function Graph() {
    const [tempData, setTempData] = useState([]);
    const [windData, setWindData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [pressureData, setPressureData] = useState([]);
    const [intervalId, setIntervalId] = useState(null);

    const [localValue, setLocalValue] = useState(limit);

    useEffect(() => {
        // Fetch initial data
        getConfigurations();
        fetchData();

        // Set up interval to fetch new data every 5 seconds
        const id = setInterval(fetchData, intervalTime);
        setIntervalId(id);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    async function getConfigurations() {
        const configFile = (await ipcRenderer.invoke("get_config")).current.weather;
        const networkConfig = (await ipcRenderer.invoke("get_config")).current.network;
        const defaultBackgroundColor = configFile.default_background_color;

        host = networkConfig.host;
        port = (await f1mvApi.discoverF1MVInstances(host)).port;
        if (defaultBackgroundColor === "transparent") {
            document.getElementById("background").style.backgroundColor = "gray";
            document.getElementById("background").className = "transparent";
            transparent = true;
        } else {
            document.getElementById("background").style.backgroundColor = defaultBackgroundColor;
        }

        setLimit = parseInt(configFile.datapoints);
        setLocalValue(parseInt(configFile.datapoints));
        defaultLimit = parseInt(configFile.datapoints);

        fetchData();
    }

    function fetchData() {
        const config = {
            host: host,
            port: port,
        };
        f1mvApi
            .LiveTimingAPIGraphQL(config, ["WeatherData", "WeatherDataSeries", "SessionInfo"])
            .then((response) => {
                const modifiedData = modifyData(response);
                if (modifiedData[0] !== tempData) setTempData(modifiedData[0]);

                if (modifiedData[1] !== windData) setWindData(modifiedData[1]);

                if (modifiedData[2] !== humidityData) setHumidityData(modifiedData[2]);

                if (modifiedData[3] !== pressureData) setPressureData(modifiedData[3]);
            })
            .catch((error) => console.error(error));
    }

    const handleClick = (newLimit) => {
        if (newLimit < 1) newLimit = 1;
        fetchData();
        setLocalValue(newLimit);
        setLimit = newLimit;
    };

    return (
        <div className="container">
            <div className="graphs">
                <div className="graph">
                    <ResponsiveLine
                        data={tempData}
                        colors={colors}
                        margin={{ top: 10, right: 100, bottom: 40, left: 30 }}
                        xScale={{
                            type: "time",
                            format: "%H:%M",
                            precision: "minute",
                        }}
                        xFormat="time:%H:%M"
                        yScale={{
                            type: "linear",
                            min: "auto",
                            max: "auto",
                            stacked: false,
                            reverse: false,
                        }}
                        yFormat=" >-.1f"
                        curve="cardinal"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: "bottom",
                            format: "%H:%M",
                            tickSize: 10,
                            tickValues: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                        }}
                        axisLeft={{
                            orient: "left",
                            tickSize: 5,
                            tickPadding: 5,
                            tickValues: 5,
                            tickRotation: 0,
                        }}
                        lineWidth={4}
                        pointSize={10}
                        pointColor={{ from: "color", modifiers: [] }}
                        pointBorderWidth={0}
                        pointBorderColor=""
                        pointLabelYOffset={-12}
                        useMesh={true}
                        theme={{
                            axis: {
                                ticks: {
                                    text: {
                                        fill: "#ffffff",
                                    },
                                },
                            },
                            grid: {
                                line: {
                                    stroke: "#555555",
                                },
                            },
                        }}
                        legends={[
                            {
                                anchor: "bottom-right",
                                direction: "column",
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: "left-to-right",
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: "circle",
                                symbolBorderColor: "rgba(0, 0, 0, 1)",
                                itemTextColor: "#ffffff",
                                effects: [
                                    {
                                        on: "hover",
                                        style: {
                                            itemBackground: "rgba(0, 0, 0, .03)",
                                            textColor: "#eee",
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                        tooltip={CustomTooltip}
                    />
                </div>
                <div className="buttons">
                    <button className="big-decrease" onClick={() => handleClick(localValue - 10)}>
                        -10
                    </button>
                    <button className="small-decrease" onClick={() => handleClick(localValue - 1)}>
                        -1
                    </button>
                    <button className="reset" onClick={() => handleClick(defaultLimit)}>
                        Reset
                    </button>
                    <button className="small-increase" onClick={() => handleClick(localValue + 1)}>
                        +1
                    </button>
                    <button className="big-increase" onClick={() => handleClick(localValue + 10)}>
                        +10
                    </button>
                </div>
                <div className="graph">
                    <ResponsiveLine
                        data={windData}
                        colors={colors}
                        margin={{ top: 10, right: 100, bottom: 40, left: 30 }}
                        xScale={{
                            type: "time",
                            format: "%H:%M",
                            precision: "minute",
                        }}
                        xFormat="time:%H:%M"
                        yScale={{
                            type: "linear",
                            min: "auto",
                            max: "auto",
                            stacked: false,
                            reverse: false,
                        }}
                        yFormat=" >-.1f"
                        curve="cardinal"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: "bottom",
                            format: "%H:%M",
                            tickSize: 10,
                            tickValues: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                        }}
                        axisLeft={{
                            orient: "left",
                            tickSize: 5,
                            tickPadding: 5,
                            tickValues: 5,
                            tickRotation: 0,
                        }}
                        lineWidth={4}
                        pointSize={10}
                        pointColor={{ from: "color", modifiers: [] }}
                        pointBorderWidth={0}
                        pointBorderColor=""
                        pointLabelYOffset={-12}
                        useMesh={true}
                        theme={{
                            axis: {
                                ticks: {
                                    text: {
                                        fill: "#ffffff",
                                    },
                                },
                            },
                            grid: {
                                line: {
                                    stroke: "#555555",
                                },
                            },
                        }}
                        legends={[
                            {
                                anchor: "bottom-right",
                                direction: "column",
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: "left-to-right",
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: "circle",
                                symbolBorderColor: "rgba(0, 0, 0, 1)",
                                itemTextColor: "#ffffff",
                                effects: [
                                    {
                                        on: "hover",
                                        style: {
                                            itemBackground: "rgba(0, 0, 0, .03)",
                                            textColor: "#eee",
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                        tooltip={CustomTooltip}
                    />
                </div>
            </div>
            <div className="info">
                <div className="bullet">
                    <ResponsiveBullet
                        data={humidityData}
                        margin={{ top: 5, right: 50, bottom: 10, left: 0 }}
                        layout="vertical"
                        spacing={50}
                        theme={{
                            axis: {
                                ticks: {
                                    text: {
                                        fill: "#ffffff",
                                    },
                                },
                            },
                        }}
                        titleAlign="middle"
                        titleOffsetX={0}
                        titleOffsetY={16}
                        tickValues={[25, 50, 100]}
                        rangeColors={infoColors}
                        measureColors={measureColors}
                        markerColors={maxColor}
                        measureSize={0.35}
                        markerSize={0.65}
                    />
                    <ResponsiveBullet
                        data={pressureData}
                        margin={{ top: 5, right: 50, bottom: 10, left: 0 }}
                        layout="vertical"
                        spacing={50}
                        theme={{
                            axis: {
                                ticks: {
                                    text: {
                                        fill: "#ffffff",
                                    },
                                },
                            },
                        }}
                        titleAlign="middle"
                        titleOffsetX={0}
                        titleOffsetY={16}
                        rangeColors={infoColors}
                        measureColors={measureColors}
                        markerColors={maxColor}
                        measureSize={0.35}
                        markerSize={0.65}
                        minValue={925}
                    />
                </div>
                <div className="rain">
                    <p>NO RAIN</p>
                </div>
                <div className="wind-direction">
                    <img src="./src/compass.png" />
                </div>
            </div>
        </div>
    );
}

export default Graph;

export let setLimit = limit;
