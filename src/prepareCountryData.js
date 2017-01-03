const fs = require('fs');
const Baby = require('babyparse');

const results = Baby.parseFiles('./countries.csv', {
  delimiter: '\t',
  header: true,
  error: (err, file, inputElem, reason) => {
    console.err({err, file, inputElem, reason});
  }
});

console.log('countryData loaded');
const countryData = results.data;
const countryCodes = {};
const countryNames = {};
for (let item of countryData) {
  const countryName = item['Country Name'];
  const countryCode = item['ISO ALPHA-3 Code'];
  countryCodes[countryName] = countryCode;
  countryNames[countryCode] = countryName;
}
fs.writeFileSync('./countries.json', JSON.stringify({countryCodes, countryNames}), 'utf-8');
