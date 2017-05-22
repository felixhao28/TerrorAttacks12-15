# TerrorAttacks12-15
Visualization of terrorism attacks during 2012 to 2015

## Build

This project uses [Webpack](https://webpack.github.io/) for bundling.
Run `webpack --watch` for dev builds and `webpack --env=dist` for production build

Learn NodeJS and webpack if you don't understand what I am saying.

## Data processing

Raw data is in `src/data.csv`. There are two scripts to prepare statistics data for display: `prepareCountryData.js` and `prepareData.js`. Run them with `node prepareCountryData.js` and `node prepareData.js` in order if you want to update raw data. Then, restart webpack to bundle the new data into JS bundle file.

`src/countries.csv` is a tab separated file containing all the information on countries and regions. Modify it as you need and run the two scripts and webpack to adjust the statistics result.
