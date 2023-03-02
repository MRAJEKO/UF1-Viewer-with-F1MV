import { setLimit } from "./graph";

function parseTime(time) {
    const [seconds, minutes, hours] = time
        .split(":")
        .reverse()
        .map((number) => parseInt(number));

    if (hours === undefined) return (minutes * 60 + seconds) * 1000;

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export const modifyData = (data) => {
    const timeOffset = parseTime(data.SessionInfo.GmtOffset);
    const weatherDataSeries = data.WeatherDataSeries.Series.slice(-setLimit);
    const airTempCoords = [];
    const trackTempCoords = [];
    const windSpeedCoords = [];
    for (let serieIndex = 0; serieIndex < weatherDataSeries.length; serieIndex++) {
        const serie = weatherDataSeries[serieIndex];

        const date = new Date(new Date(serie.Timestamp).getTime() + timeOffset);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");

        const airTemp = serie.Weather.AirTemp;
        const airTempCoord = { x: `${hours}:${minutes}`, y: airTemp };
        airTempCoords.push(airTempCoord);

        const trackTemp = serie.Weather.TrackTemp;
        const trackTempCoord = { x: `${hours}:${minutes}`, y: trackTemp };
        trackTempCoords.push(trackTempCoord);

        const windSpeed = serie.Weather.WindSpeed;
        const windSpeedCoord = { x: `${hours}:${minutes}`, y: parseFloat(windSpeed) * 3.6 };
        windSpeedCoords.push(windSpeedCoord);
    }

    let maxHumidity = parseFloat(data.WeatherData.Humidity);
    let maxPressure = parseFloat(data.WeatherData.Pressure);
    for (const serie of weatherDataSeries) {
        console.log(serie);
        const humidity = parseFloat(serie.Weather.Humidity);
        const pressure = parseFloat(serie.Weather.Pressure);
        if (humidity > maxHumidity) maxHumidity = humidity;

        if (pressure > maxPressure) maxPressure = pressure;
    }

    const humidity = parseFloat(data.WeatherData.Humidity);
    const pressure = parseFloat(data.WeatherData.Pressure);

    const modifiedData = [
        [
            {
                id: "Air Temp",
                color: "hsl(0, 100%, 36%)",
                data: airTempCoords,
            },
            { id: "Track Temp", color: "hsl(131, 100%, 36%)", data: trackTempCoords },
        ],
        [
            {
                id: "Wind Speed",
                color: "hsl(0, 100%, 36%)",
                data: windSpeedCoords,
            },
        ],
        [
            {
                id: "Humidity",
                ranges: [0, 40, 100],
                measures: [humidity],
                markers: [maxHumidity],
            },
        ],
        [
            {
                id: "Pressure",
                ranges: [0, 950, 1050, 1075],
                measures: [pressure],
                markers: [maxPressure],
            },
        ],
    ];
    return modifiedData;
};
