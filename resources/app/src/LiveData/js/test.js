// fetch("http://ergast.com/api/f1/current/driverStandings.json")
//   .then((response) => response.json())
//   .then((data) => {
//     console.log(data);
//     let section = ".MRData.StandingsTable.StandingsLists[0].DriverStandings";
//     let fields = [".Driver.familyName", ".points"];
//     blah(data, section, fields);
//   })
//   .catch((err) => {
//     console.log("Something went wrong!", err);
//   });

// function blah(data, section, fields) {
//   let standings;
//   for (i in fields) {
//     standings = data.section + fields[i];
//   }
//   console.log(standings);
//   for (let i in standings) {
//     let name = standings[i].Driver.familyName;
//     let points = standings[i].points;
//     console.log(name + " = " + points);
//   }
// }

// let string = "Verstappen";
// eval(string + " = 9");
// console.log(Verstappen);

// let blah = {};

// function fillshit() {
//   let nameArray = ["barbara", "aiden", "dean", "eldert", "peter"];
//   let pointsArray = [20, 10, 5, 2, 1];
//   for (i in nameArray) {
//     blah[nameArray[i]] = pointsArray[i];
//   }
// }

// fillshit();
// console.log(blah);
