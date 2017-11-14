// Load data asynchronously
queue()
  .defer(d3.json,"data/data_sample.json")
  .await(createVis);

// Static Components
function createVis(error, data) {

  // store data in global variable
  allData = data;

  var defenderVis = new DefenderVis("shot-distance-chart", data);

}