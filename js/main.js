// Load data asynchronously
queue()
  .defer(d3.json,"data/data_cleaned.json")
  .await(createVis);

// Static Components
function createVis(error, data) {
	console.log(data);

  // store data in global variable
  allData = data;


  slider_created = false;
  var defenderVis_Threes = new DefenderVis("shot-distance-chart-1", data, 3);
  var defenderVis = new DefenderVis("shot-distance-chart-2", data, 2);

  var shotChartVis = new ShotChartVis("shot-chart-court", data);

  var openShotVis = new OpenShotVis("open-shot", data);

}
