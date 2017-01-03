/*global Datamap*/
/*global d3*/
/*global $*/

import './style.scss';

import _ from 'lodash';
import RadarChart from './RadarChart';
import countryTotal from './countryTotal.json';
import { bigAttacks } from './bigAttacks.json';
import { scenarioVsWeaponData } from './scenarioVsWeapon.json';
import { countryCodes, countryNames } from './countries.json';

let highestCountryAttacks = 1;
var paletteScale = d3.scale.pow(0.01)
  .domain([0, 1])
  .range(['#e3e3e3', '#ff0000']);

for (let country in countryTotal) {
  if (countryTotal[country].count > 0) {
    highestCountryAttacks = Math.max(highestCountryAttacks, countryTotal[country].count);
  }
}

const _countryTotal = {};

for (let country in countryTotal) {
  if (countryTotal[country].count > 0) {
    const o = _.clone(countryTotal[country]);
    o.fillColor = paletteScale(countryTotal[country].count / highestCountryAttacks);
    _countryTotal[country] = o;
  }
}

// World map
var map = null;

function render() {
  map = new Datamap({
    scope: 'world',
    element: document.getElementById('container1'),
    projection: 'mercator',
    height: '900',
    geographyConfig: {
      popupTemplate: (geography, data) => {
        return '<div class="hoverinfo"><b>' + geography.properties.name + '</b><br>Attacks:' + (data ? data.count : 0) + ' ';
      }
    },
    fills: {
      defaultFill: '#e3e3e3',
      attack: 'blue',
      bigAttack: 'red'
    },

    data: _countryTotal
  });
  // bubbles, custom popup on hover template
  map.bubbles(_bigAttacks, {
    borderWidth: 0,
    popupTemplate: function (geo, data) {
      return '<div class=\'hoverinfo\'>Deaths: <b>' + (data.DeathCount || '-') + '</b> Injuries: <b>' + (data.InjuryCount || '-') + '</b><br>' + data.Abstract + '</div>';
    }
  });
}

let mostCasualty = bigAttacks[bigAttacks.length - 1].DeathCount;
for (let i = 0;i < bigAttacks.length - 10;i++) {
  const attack = bigAttacks[i];
  attack.radius = Math.max(2, (attack.DeathCount / mostCasualty) * 20);
  attack.fillKey = 'attack';
}
for (let i = bigAttacks.length - 10;i < bigAttacks.length;i++) {
  const attack = bigAttacks[i];
  attack.radius = 10;
  attack.fillKey = 'bigAttack';
  attack.borderWidth = 1;
  attack.fillOpacity = 1;
}
let _bigAttacks = bigAttacks;

render();

// Terror org filter

function update() {
  map.updateChoropleth(_countryTotal);
  map.bubbles(_bigAttacks, {
    borderWidth: 0,
    popupTemplate: function (geo, data) {
      return '<div class=\'hoverinfo\'>Deaths: <b>' + (data.DeathCount || '-') + '</b> Injuries: <b>' + (data.InjuryCount || '-') + '</b><br>' + data.Abstract + '</div>';
    }
  });
}

const groupedByOrg = _.groupBy(bigAttacks, 'TerrorOrg');
let orgs = Object.keys(groupedByOrg);
orgs = _.sortBy(orgs, (org) => groupedByOrg[org].length);
for (let i = orgs.length - 1;i >= Math.max(0, orgs.length - 8);i--) {
  $('#orgFilter > fieldset').append(`<label for="radio-${i}">${orgs[i]}</label>
    <input class="org" type="radio" name="orgs" id="radio-${i}" index="${i}">`);
}

$(function () {
  $('input[name=orgs]').checkboxradio({icon: false}).on('click', function (e) {
    const index = $(e.target).attr('index');
    if (index === 'all') {
      _bigAttacks = bigAttacks;
    } else {
      _bigAttacks = groupedByOrg[orgs[parseInt(index)]];
    }
    update();
  });
});

// Country stat bar chart
let countryStatData = [];
for (let country in countryTotal) {
  if (countryTotal[country].count > 0) {
    countryStatData.push({
      name: countryNames[country],
      count: countryTotal[country].count
    });
  }
}
countryStatData = _(countryStatData).sortBy('count').reverse().take(10).value();

$(function () {
  var svg = d3.select('svg#countryStat'),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr('width') - margin.left - margin.right,
    height = +svg.attr('height') - margin.top - margin.bottom;
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear()
    .range([height, 0]);
  y.domain([0, highestCountryAttacks]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var barWidth = width / countryStatData.length;

  var bar = svg.selectAll('g')
    .data(countryStatData)
    .enter().append('g')
    .attr('transform', function (d, i) { return 'translate(' + i * barWidth + ',0)'; });

  bar.append('rect')
    .attr('y', function (d) { return y(d.count); })
    .attr('height', function (d) { return height - y(d.count); })
    .attr('width', barWidth - 1)
    .on('click', (d) => {
      const code = countryCodes[d.name];
      const radarData = [];
      for (let weapon in countryTotal[code]) {
        if (weapon !== 'count') {
          radarData.push({
            axis: weapon,
            value: countryTotal[code][weapon]
          });
        }
      }

      var w = 500,
        h = 500;

      // Options for the Radar chart, other than default
      var mycfg = {
        w: w,
        h: h,
        levels: 6,
        ExtraWidthX: 300
      };

      // Call function to draw the Radar chart
      // Will expect that data is in %'s
      RadarChart.draw('#typeStat', [radarData], mycfg);
    });

  bar.append('text')
    .attr('class', 'value')
    .attr('x', barWidth / 2)
    .attr('y', function (d) { return y(d.count) + 3; })
    .attr('dy', '.75em')
    .text(function (d) { return d.count; });

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em').text((d) => d.name);

  bar.append('text')
    .attr('class', 'label')
    .attr('x', barWidth / 2)
    .attr('y', y(0) + 5)
    .attr('dy', '.75em')
    .text(function (d) { return d.name; });
});

// sunburst

let sunburstData = {};
let sunburstSum = {};
let sunburstOrder = 'Scenario';
function updateSunburst() {
  sunburstData = {};
  for (const {Weapon, Scenario, count} of scenarioVsWeaponData) {
    if (sunburstOrder === 'Scenario') {
      if (!(Scenario in sunburstData)) {
        sunburstData[Scenario] = {};
        sunburstSum[Scenario] = 0;
      }
      sunburstData[Scenario][Weapon] = count;
      sunburstSum[Scenario] += count;
    } else {
      if (!(Weapon in sunburstData)) {
        sunburstData[Weapon] = {};
        sunburstSum[Weapon] = 0;
      }
      sunburstData[Weapon][Scenario] = count;
      sunburstSum[Weapon] += count;
    }
  }
}

var w = 900,
  h = 900,
  r = Math.min(w, h) / 2,
  color = d3.scale.category20c();

var vis = d3.select('#sunburst').append('svg:svg')
  .attr('width', w)
  .attr('height', h)
  .append('svg:g')
  .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

var blankRadius = 30;

var partition = d3.layout.partition()
  .sort((d1, d2) => {
    return sunburstSum[d2.key] - sunburstSum[d1.key];
  })
  .size([2 * Math.PI, r - blankRadius])
  .children(function (d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
  .value(function (d) { return d.value; });

var arc = d3.svg.arc()
  .startAngle(function (d) { return d.x; })
  .endAngle(function (d) { return d.x + d.dx; })
  .innerRadius(function (d) { return d.y + blankRadius; })
  .outerRadius(function (d) { return d.y + d.dy + blankRadius; });

updateSunburst();

var g = vis.data(d3.entries({sunburstData})).selectAll('g')
  .data(partition)
  .enter().append('svg:g')
  .attr('display', function (d) { return d.depth ? null : 'none'; }); // hide inner ring

g.append('svg:path')
  .attr('d', arc)
  .attr('stroke', '#fff')
  .attr('fill', function (d) { return color((d.children ? d : d.parent).key); })
  .attr('fill-rule', 'evenodd')
  .on('mouseover', function (d) {
    vis.selectAll('text.label').text(d.key + ': ' + (sunburstSum[d.key] || d.value));
  });

vis.append('svg:text')
  .attr('class', 'label')
  .attr('x', 0)
  .attr('y', 0)
  .attr('dy', '.75em')
  .text('...');
