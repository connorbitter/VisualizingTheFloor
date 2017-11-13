
/*
 * LineChart - Object constructor function
 * @param _parentElement  -- the HTML element in which to draw the area chart
 * @param _data           -- the dataset
 */

LineChart = function(_parentElement, _data, _slider){
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = [];
  this.slider = document.getElementById(_slider);

  this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

LineChart.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 10, right: 10, bottom: 20, left: 20 };

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = 300 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
  .attr("width", vis.width + vis.margin.left + vis.margin.right)
  .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
  .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Scales and Axes
  vis.x = d3.scaleLinear()
    .range([0, vis.width]);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.xAxis = d3.axisBottom()
    .scale(vis.x);

  vis.yAxis = d3.axisLeft()
    .scale(vis.y);

  vis.svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + vis.height + ")");

  vis.svg.append("g")
    .attr("class", "y-axis axis");

  // Line
  var line = d3.line()
  vis.svg.append("path")
    .attr("class", "line")

  // (Filter, aggregate, modify data)
  vis.wrangleData();
}


/*
 * Data wrangling
 */

LineChart.prototype.wrangleData = function(){
  var vis = this;

  // Update the visualization
  vis.updateVis();
}


/*
 * The drawing function
 */

LineChart.prototype.updateVis = function(){
  var vis = this;

  // Update domains

  // Draw line

  // Call axis functions with the new domain 
  vis.svg.select(".x-axis").call(vis.xAxis);
  vis.svg.select(".y-axis").call(vis.yAxis);
  
}

