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
  let {Weapon, Target} = rows.data[i];

  if (Target === '.' || !Target) {
    Target = 'Unknown';
  }

  if (!Weapon) {
    Weapon = 'Unknown';
  }

  if (!(Target in scenarioVsWeapon)) {
    scenarioVsWeapon[Target] = {};
  }
  if (!(Weapon in scenarioVsWeapon[Target])) {
    scenarioVsWeapon[Target][Weapon] = 0;
  }
  scenarioVsWeapon[Target][Weapon]++;
}

const scenarioVsWeaponData = [];
for (let target in scenarioVsWeapon) {
  for (let weapon in scenarioVsWeapon[target]) {
    scenarioVsWeaponData.push({
      Target: target,
      Weapon: weapon,
      count: scenarioVsWeapon[target][weapon]
    });
  }
}
console.log(scenarioVsWeaponData.length);
fs.writeFileSync('./scenarioVsWeapon.json', JSON.stringify({scenarioVsWeaponData}), 'utf-8');
