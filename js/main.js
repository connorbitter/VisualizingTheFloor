// Load data asynchronously
queue()
  .defer(d3.json,"data/data_cleaned.json")
  .defer(d3.json,"data/team_colors.json")
  .await(createVis);

// Static Components
function createVis(error, data, colors) {
	console.log(data);

  // Store data global variables
  allData = data;

  // Store team color data
  teamColors = {};
  for (var key in colors) {
    teamColors[colors[key]['fullName']] = colors[key]
  }

  slider_created = false;
  var defenderVis_Threes = new DefenderVis("shot-distance-chart-1", data, 3);
  var defenderVis = new DefenderVis("shot-distance-chart-2", data, 2);

  var touchTimeVis_Threes = new LineChartVis("touch-time-chart-1", data, "TOUCH_TIME", 3);
  var touchTimeVis = new LineChartVis("touch-time-chart-2", data, "TOUCH_TIME", 2);

  var shotClockVis_Threes = new LineChartVis("shot-clock-chart-1", data, "SHOT_CLOCK", 3);
  var shotClockVis = new LineChartVis("shot-clock-chart-2", data, "SHOT_CLOCK", 2);

  var shotChartVis = new ShotChartVis("shot-chart-court", data);

  var openShotVis = new OpenShotVis("open-shot", data);

}
