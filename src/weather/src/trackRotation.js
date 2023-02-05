const f1mvApi = require("npm_f1mv_api");

export const trackRotation = async (config) => {
    console.log(config);
    if (config.port !== undefined) {
        const sessionInfo = (await f1mvApi.LiveTimingAPIGraphQL(config, "SessionInfo")).SessionInfo;
        console.log(sessionInfo);
        const circuitId = sessionInfo.Meeting.Circuit.Key;
        const year = new Date(sessionInfo.StartDate).getFullYear();
        const circuitRotation = (await f1mvApi.getCircuitInfo(circuitId, year)).rotation;
        return circuitRotation;
    }
};
