// Hard Coded Information
const sessionType = "sprint";

const fastestLap = "Stroll";

// TEMP Postions Drivers
const pos = [
  "Verstappen",
  "Hamilton",
  "Pérez",
  "Russell",
  "Leclerc",
  "Sainz",
  "Albon",
  "Latifi",
  "Stroll",
  "Schumacher",
];
//
//
//
//
//
// Race Points Per Position
const ppp = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pointPlaces = ppp.length;

// Print Points
const sppp = [8, 7, 6, 5, 4, 3, 2, 1];
const pointPlacesSprint = sppp.length;

// Fastest Lap Point
const flp = 1;

// Add the name and points into a dictionary
let standings = {};
let standingsPos = {};
function standingsResponse(data) {
  let currentStandings =
    data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  for (i in currentStandings) {
    let name = currentStandings[i].Driver.familyName;
    let points = currentStandings[i].points;
    standings[name] = points;
    standingsPos[name] = Number(i) + 1;
  }
  newPoints();
}

// Get the driverstandings before the race
fetch("http://ergast.com/api/f1/current/driverStandings.json")
  .then((response) => response.json())
  .then((data) => {
    standingsResponse(data);
  })
  .catch((err) => {
    console.log("Something went wrong!", err);
  });

let newStandings = {};
function newPoints() {
  if (sessionType != "sprint") {
    for (i in pos) {
      if (i < pointPlaces) {
        const name = pos[i];
        let extraPoint = 0;
        if (name == fastestLap) {
          extraPoint = 1;
        }
        const currentPoints = Number(standings[name]);
        const newPoints = currentPoints + ppp[i] + extraPoint;
        newStandings[name] = newPoints;
      } else {
        const name = pos[i];
        const currentPoints = Number(standings[name]);
        newStandings[name] = currentPoints;
      }
    }
  } else {
    for (i in pos) {
      if (i < pointPlacesSprint) {
        const name = pos[i];
        const currentPoints = Number(standings[name]);
        const newPoints = currentPoints + sppp[i];
        newStandings[name] = newPoints;
      } else {
        const name = pos[i];
        const currentPoints = Number(standings[name]);
        newStandings[name] = currentPoints;
      }
    }
  }
  for (i in standings) {
    if (i in newStandings) {
    } else {
      newStandings[i] = Number(standings[i]);
    }
  }
  sortPropertiesByValue(newStandings);
}

function sortPropertiesByValue(object) {
  const keys = Object.keys(object);
  const valuesIndex = keys.map((key) => ({ key, value: object[key] }));
  valuesIndex.sort(function (a, b) {
    if (b.value - a.value != 0) {
      return b.value - a.value;
    } else {
      if (standingsPos[a] < standingsPos[b]) {
        return standingsPos[b.key] - standingsPos[a.key];
      } else {
        return standingsPos[a.key] - standingsPos[b.key];
      }
    }
  });

  const newObject = {};

  for (const item of valuesIndex) {
    newObject[item.key] = item.value;
    console.log(item.key + " = " + item.value);
  }

  return newObject;
}
