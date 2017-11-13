// SVG drawing area
var margin = {top: 20, right: 20, bottom: 40, left: 80};

var width = parseInt(d3.select('#shot-distance-chart').style('width'), 10),
    width = width - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#shot-distance-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var min, max;
var allData = [];
var percentages = {};

// Scales
var x = d3.scaleLinear()
    .range([0, width])

var y = d3.scaleLinear()
  .range([height, 0])

// Axes
var xAxis = d3.axisBottom()
var yAxis = d3.axisLeft()

// Draw Axes
svg.append("g")
  .attr("class", "axis x-axis")
  .attr("transform", "translate(0," + height + ")")

svg.append("g")
  .attr("class", "axis y-axis")

// Label Axes
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (-margin.left / 1.5) + "," + (height / 2) + ")rotate(-90)")
    .text("Shot Percentage")

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (width / 2) + "," + (height - (margin.bottom / 4)) + ")")
    .text("Defender Distance (ft)");

// Line
var line = d3.line()
svg.append("path")
  .attr("class", "line")

// Slider 
var slider = document.getElementById('def-dist-slider');

// Load data asynchronously
queue()
  .defer(d3.json,"data/data_sample.json")
  .await(createVis);

// Static Components
function createVis(error, data) {

  // store data in global variable
  allData = data;

  // Min/Max Defender Distance
  min = d3.min(allData, function(d){return d.CLOSE_DEF_DIST});
  max = d3.max(allData, function(d){return d.CLOSE_DEF_DIST});

  // Store shot percentages by distance (min. 10 shots)
  percentages.by_def_distance = {}
  for (i = min; i < max + 0.1; i = i + 0.1) {

    // Fix floating point error
    i_r = (Math.round(i * 10) / 10);

    // Counters
    var shots_total = 0
    var shots_made = 0

    // Loop through all shots
    for (j = 0; j < data.length; j++) {
      if (data[j]['CLOSE_DEF_DIST'] == i_r) {
        shots_total++;
        shots_made += data[j]['FGM']
      }
    }

    if (shots_total >= 10) 
      percentages.by_def_distance[i_r.toFixed(1)] = (shots_made / shots_total);

  }

  console.log(percentages.by_def_distance)
  

  // Create slider based on data
  noUiSlider.create(slider, {
    start: [min, max],
    step: 0.1,
    connect: true,
    tooltips: true,
    range: {
      'min': min,
      'max': max
    }});

  slider.noUiSlider.on('update', function(values, handle) {
      //distValues[handle].innerHTML = +values[handle]
      updateVis();
    });
}

function updateVis() {

  var filteredData = allData;
  var sliderRange = slider.noUiSlider.get();

  filteredData = filteredData.filter(function(d) {
    return ((d.CLOSE_DEF_DIST >= sliderRange[0]) && (d.CLOSE_DEF_DIST <= sliderRange[1]))
  });

  x = x.domain(d3.extent(filteredData, function(d){return d.CLOSE_DEF_DIST}))
  y = y.domain([0, 1])

  // Update Axes
  xAxis = xAxis.scale(x)
  yAxis = yAxis.scale(y).tickFormat(function(d){return (d * 100) + "%"});

  d3.select(".x-axis")
    .transition()
    .duration(800)
    .call(xAxis)

  d3.select(".y-axis")
    .transition()
    .duration(800)
    .call(yAxis)

  // Update Line
  line = line
    .x(function(d) { return x(d); })
    .y(function(d) { 
      if (isNaN(percentages.by_def_distance[d])) {
        return y(0);
      } 
      else {
        return y(percentages.by_def_distance[d]);
      }
    })

  // Filter before drawing line
  draw_distances = Object.keys(percentages.by_def_distance)
                    .filter(function(d){
                      console.log(parseFloat(d))
                      return ((parseFloat(d) >= sliderRange[0]) && (parseFloat(d) <= sliderRange[1]))
                    })

  console.log(draw_distances);

  d3.select(".line")
    .attr("d", line(draw_distances))
    .attr("class", "line")
    .attr("stroke", "#003DA5")
    .attr("stroke-width", 2)
    .attr("fill", "none");

}
