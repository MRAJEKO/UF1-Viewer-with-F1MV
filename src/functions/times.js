// A lap or sector time can be send through and will return as a number in seconds
function parseLapOrSectorTime(time) {
    // Split the input into 3 variables by checking if there is a : or a . in the time. Then replace any starting 0's by nothing and convert them to numbers using parseInt.
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number) => parseInt(number.replace(/^0+/, "") || "0", 10));

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

function formatMsToF1(ms, fixedAmount) {
    const minutes = Math.floor(ms / 60000);

    let milliseconds = ms % 60000;

    const seconds =
        milliseconds / 1000 < 10 && minutes > 0
            ? "0" + (milliseconds / 1000).toFixed(fixedAmount)
            : (milliseconds / 1000).toFixed(fixedAmount);

    return minutes > 0 ? minutes + ":" + seconds : seconds;
}

module.exports = {
    parseLapOrSectorTime,
    formatMsToF1,
};
