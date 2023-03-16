function getCarData(driverNumber, carData) {
    try {
        carData[0].Cars[driverNumber].Channels;
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[driverNumber].Channels;
}

function getSpeedThreshold(sessionType, sessionStatus, trackStatus) {
    if (
        sessionType === "Qualifying" ||
        sessionType === "Practice" ||
        trackStatus.Status === "4" ||
        trackStatus.Status === "6" ||
        trackStatus.Status === "7"
    )
        return 10;
    if (sessionStatus === "Inactive" || sessionStatus === "Aborted") return 0;
    return 30;
}

function weirdCarBehaviour(racingNumber, timingData, carData, sessionType, sessionStatus, trackStatus) {
    const driverCarData = getCarData(racingNumber, carData);

    if (driverCarData === "error") return false;

    const driverTimingData = timingData[racingNumber];

    const rpm = driverCarData[0];

    const speed = driverCarData[2];

    const gear = driverCarData[3];

    const speedLimit = getSpeedThreshold(sessionType, sessionStatus, trackStatus);

    return (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear ===
            (sessionStatus === "Inactive" ||
            sessionStatus === "Aborted" ||
            (sessionType !== "Race" && driverTimingData.PitOut)
                ? ""
                : 0)
    );
}

module.exports = {
    getCarData,
    getSpeedThreshold,
    weirdCarBehaviour,
};
