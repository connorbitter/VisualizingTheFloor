// (1) Load data asynchronously
queue()
  .defer(d3.json,"data/data_sample.json")
  .await(createVis);


function createVis(error, data){

  console.log(data);

}
