const fs = require('fs');
const Baby = require('babyparse');
const country = require('./countries.json');

const rows = Baby.parseFiles('./data.csv', {
  header: true
});

const {countryCodes} = country;
const countryTotal = {};
for (let i = 0;i < rows.data.length;i++) {
  const {Country, Weapon} = rows.data[i];
  const countryCode = countryCodes[Country];
  if (!countryCode) {
    console.log(Country);
  } else {
    if (!(countryCode in countryTotal)) {
      countryTotal[countryCode] = {count: 0};
    }
    countryTotal[countryCode].count++;
    if (!(Weapon in countryTotal[countryCode])) {
      countryTotal[countryCode][Weapon] = 0;
    }
    countryTotal[countryCode][Weapon]++;
  }
}
fs.writeFileSync('./countryTotal.json', JSON.stringify(countryTotal), 'utf-8');

const bigAttacks = [];
for (let i = 0;i < rows.data.length;i++) {
  const {DeathCount, InjuryCount} = rows.data[i];
  if ((DeathCount || 0) > 5) {
    bigAttacks.push({
      latitude: rows.data[i].Latitude,
      longitude: rows.data[i].Longitude,
      DeathCount,
      InjuryCount,
      Abstract: rows.data[i].Abstract,
      TerrorOrg: rows.data[i].TerrorOrg
    });
  }
}
bigAttacks.sort((a, b) => {
  return a.DeathCount - b.DeathCount;
});
console.log(bigAttacks.length);
fs.writeFileSync('./bigAttacks.json', JSON.stringify({bigAttacks}), 'utf-8');

const scenarioVsWeapon = {};
for (let i = 0;i < rows.data.length;i++) {
  let {Weapon, Scenario} = rows.data[i];

  if (Scenario === '.' || !Scenario) {
    Scenario = 'Unknown';
  }

  if (!Weapon) {
    Weapon = 'Unknown';
  }

  if (!(Scenario in scenarioVsWeapon)) {
    scenarioVsWeapon[Scenario] = {};
  }
  if (!(Weapon in scenarioVsWeapon[Scenario])) {
    scenarioVsWeapon[Scenario][Weapon] = 0;
  }
  scenarioVsWeapon[Scenario][Weapon]++;
}
const scenarioVsWeaponData = [];
for (let scenario in scenarioVsWeapon) {
  for (let weapon in scenarioVsWeapon[scenario]) {
    scenarioVsWeaponData.push({
      Scenario: scenario,
      Weapon: weapon,
      count: scenarioVsWeapon[scenario][weapon]
    });
  }
}
console.log(scenarioVsWeaponData.length);
fs.writeFileSync('./scenarioVsWeapon.json', JSON.stringify({scenarioVsWeaponData}), 'utf-8');
