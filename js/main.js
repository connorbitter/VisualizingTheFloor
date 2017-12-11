var abbrevs = {
  "ATL": "Atlanta Hawks",
  "BKN": "Brooklyn Nets",
  "BOS": "Boston Celtics",
  "CHA": "Charlotte Hornets",
  "CHI": "Chicago Bulls",
  "CLE": "Cleveland Cavaliers",
  "DAL": "Dallas Mavericks",
  "DEN": "Denver Nuggets",
  "DET": "Detroit Pistons",
  "GSW": "Golden State Warriors",
  "HOU": "Houston Rockets",
  "IND": "Indiana Pacers",
  "LAC": "Los Angeles Clippers",
  "LAL": "Los Angeles Lakers",
  "MEM": "Memphis Grizzlies",
  "MIA": "Miami Heat",
  "MIL": "Milwaukee Bucks",
  "MIN": "Minnesota Timberwolves",
  "NOP": "New Orleans Pelicans",
  "NYK": "New York Knicks",
  "OKC": "Oklahoma City Thunder",
  "ORL": "Orlando Magic",
  "PHI": "Philadelphia 76ers",
  "PHX": "Phoenix Suns",
  "POR": "Portland Trail Blazers",
  "SAC": "Sacramento Kings",
  "SAS": "San Antonio Spurs",
  "TOR": "Toronto Raptors",
  "UTA": "Utah Jazz",
  "WAS": "Washington Wizards",
};


// Create writers vis
var writerSVG = `
<svg class="writer" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   viewBox="0 0 350 350" style="enable-background:new 0 0 350 350;" xml:space="preserve">
<g>
  <path d="M175,171.173c38.914,0,70.463-38.318,70.463-85.586C245.463,38.318,235.105,0,175,0s-70.465,38.318-70.465,85.587
    C104.535,132.855,136.084,171.173,175,171.173z"/>
  <path d="M41.909,301.853C41.897,298.971,41.885,301.041,41.909,301.853L41.909,301.853z"/>
  <path d="M308.085,304.104C308.123,303.315,308.098,298.63,308.085,304.104L308.085,304.104z"/>
  <path d="M307.935,298.397c-1.305-82.342-12.059-105.805-94.352-120.657c0,0-11.584,14.761-38.584,14.761
    s-38.586-14.761-38.586-14.761c-81.395,14.69-92.803,37.805-94.303,117.982c-0.123,6.547-0.18,6.891-0.202,6.131
    c0.005,1.424,0.011,4.058,0.011,8.651c0,0,19.592,39.496,133.08,39.496c113.486,0,133.08-39.496,133.08-39.496
    c0-2.951,0.002-5.003,0.005-6.399C308.062,304.575,308.018,303.664,307.935,298.397z"/>
</g>
</svg>
`
for (var i = 0; i < 28; i++) {
  $("#writer-vis").append(writerSVG);
}

// Initiate Counters
$('.counter').counterUp();

// Load data asynchronously
queue()
  .defer(d3.json,"data/data_cleaned.json")
  .defer(d3.json,"data/team_colors.json")
  .defer(d3.csv, "data/14-15-pergame.csv")
  .defer(d3.csv, "data/14-15-defense-pergame.csv")
  .await(createVis);

// Static Components
function createVis(error, data, colors, season, seasonDefense) {
  // Store 2014-2015 season data
  /*seasonData = {};
  for (var i = 0; i < season.length; i++) {
    seasonData[season[i]['TEAM']] = season[i]
    for (var key in season[i]) {
      if (key != "TEAM") {
        seasonData[season[i]['TEAM']][key] = +seasonData[season[i]['TEAM']][key]
      }
    }
    delete seasonData[season[i]['TEAM']].TEAM
  }*/
  var keys = Object.keys(season[0]);
  var keyslength = keys.length;
  season.forEach(function(d) {
    for (var k = 0; k < keyslength; k++) {
      if (keys[k] != "TEAM") {
        d[keys[k]] = +d[keys[k]];
      }
    }
  });

  keys = Object.keys(seasonDefense[0]);
  keyslength = keys.length;
  seasonDefense.forEach(function(d) {
    for (var k = 0; k < keyslength; k++) {
      if (keys[k] != "TEAM") {
        d[keys[k]] = +d[keys[k]];
      }
    }
  });

  // Store team color data
  teamColors = {};
  for (var key in colors) {
    teamColors[colors[key]['fullName']] = colors[key]
  }

  // Store data global variables
  allData = data;
  seasonData = season;

  slider_created = false;
  
  var defenderVis_Threes = new DefenderVis("shot-distance-chart-1", data, 3);
  var defenderVis = new DefenderVis("shot-distance-chart-2", data, 2);

  var touchTimeVis_Threes = new LineChartVis("touch-time-chart-1", data, "TOUCH_TIME", 3);
  var touchTimeVis = new LineChartVis("touch-time-chart-2", data, "TOUCH_TIME", 2);

  var shotClockVis_Threes = new LineChartVis("shot-clock-chart-1", data, "SHOT_CLOCK", 3);
  var shotClockVis = new LineChartVis("shot-clock-chart-2", data, "SHOT_CLOCK", 2);

  var shotChartVis = new ShotChartVis("shot-chart-court", data);

  var openShotVis = new OpenShotVis("open-shot", data);

  var barChartVis = new BarChartVis("bar-chart-percentages", data);

  var scatterPlotVis = new ScatterPlotVis("scatter-plot", season);

}
