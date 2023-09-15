// How much time is lost when boxing under (a) green flag conditions, and (b) VSC conditions?
// Depends on track, so this dict contains the data collected by hand from the Chris Medland's strategy guides on formula1.com
// Therefore, some tracks *might* not have data, and the time losses changed from year to year strongly in the strategy guides, so might be inaccurate.
// FORMAT
// "trackId" : [greenFlagConditionLoss, vscConditionLoss]
const boxLostTimesGreenVSC = {
    '63': [22.5, 15], // Bahrain 2023
    '149': [20, 11], // Jeddah 2023
    '10': [19.5, 13.5], // Melbourne 2023
    '144': [20.5, 11], // Baku 2023
    '151': [17, 9], // Miami 2023
    '6': [NaN, NaN], // Imola
    '22': [19.5, 12], // Monaco 2023
    '15': [22, 12.5], // Barcelona 2023
    '23': [18.5, 9.5], // Montreal 2023
    '19': [20.5, 8.5], // Spielberg 2023
    '2': [20, 9], // Silverstone 2023
    '4': [19.7, 14], // Hungaroring 2022
    '7': [18.5, 11], // Spa 2023
    '55': [18, 12], // Zandvoort 2022
    '39': [24, 17], // Monza 2022
    '61': [28, 15], // Singapore 2022 TODO from here no 2023 yet
    '46': [22.5, 10], // Suzuka 2022
    '150': [24.1, 18.4], // Losail, Qatar 2021
    '9': [20, 14], // Austin 2022
    '65': [22, 15], // Mexico 2022
    '14': [21, 11], // Interlagos 2022
    // TODO LAS VEGAS
    '70': [22, 15], // Yas Marina 2022

    '28': [27, 16.5], // Paul Ricard 2022
    '147': [NaN, NaN], // Portimao
    '79': [24, 17], // Sochi 2021
    '59': [20, 14], // Istanbul 2021

};