// Load data asynchronously
queue()
  .defer(d3.json,"data/data_sample.json")
  .await(createVis);

// Static Components
function createVis(error, data) {

  // store data in global variable
  allData = data;


  slider_created = false;
  var defenderVis_Threes = new DefenderVis("shot-distance-chart-1", data, 3);
  var defenderVis = new DefenderVis("shot-distance-chart-2", data, 2);

}