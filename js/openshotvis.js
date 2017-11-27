
/*
 * OpenShotVis - Object constructor function
 * @param _parentElement  -- the HTML element in which to draw the visualization
 * @param _data           -- the actual data
 */

OpenShotVis = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data          = _data;

  this.filteredData  = this.data;

  this.initVis();
}

 OpenShotVis.prototype.initVis = function(){
  var vis = this;

  vis.margin = {top: 20, right: 20, bottom: 40, left: 80};

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Scales
  vis.x = d3.scaleBand()
      .range([0, vis.width]);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  // Axes
  vis.xAxis = d3.axisBottom();
  vis.yAxis = d3.axisLeft();

  // Draw Axes
  vis.svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + vis.height + ")");

  vis.svg.append("g")
    .attr("class", "axis y-axis");

  // Label Axes
  vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (-vis.margin.left / 1.5) + "," + (vis.height / 2) + ")rotate(-90)")
    .text("Distance (ft.)");

  vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (vis.width / 2) + "," + (vis.height + 30) + ")")
    .text("Team");

  // Title
  vis.svg.append("text")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 5))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("Average Closest Defender Distance");

  // Get list of all teams
  var unique = {};
  vis.teams = [];
  for (var i=0; i < vis.data.length; i++){
   if(typeof(unique[vis.data[i].TEAM_ID]) == "undefined"){
    vis.teams.push(vis.data[i].TEAM_ID);
   }
   unique[vis.data[i].TEAM_ID] = 0;
  }

  // Call next function
  vis.wrangleData();

 }

 OpenShotVis.prototype.wrangleData = function(){
  var vis = this;

  // Function to find average of field grouped by other field
  function average(arr, groupby, field) {
    var sums = {}, counts = {}, results = []
    for (var i = 0; i < arr.length; i++) {
        var team = arr[i][groupby];
        if (!(team in sums)) {
            sums[team] = 0;
            counts[team] = 0;
        }
        sums[team] += arr[i][field];
        counts[team]++;
    }

    for(team in sums) {
        results.push({ key: +team, value: sums[team] / counts[team] });
    }
    return [results, Object.keys(sums)];
  }

  // Average closest defender by team
  var results = average(vis.data, "TEAM_ID", "CLOSE_DEF_DIST");
  vis.averages = results[0];
  vis.teams = results[1];

  vis.updateVis();
 }

 OpenShotVis.prototype.updateVis = function(){
  var vis = this;

  // Set domains
  vis.x.domain(vis.teams);
  vis.y.domain([0, d3.max(vis.averages, function(d){ return d.value })]);

  var bar = vis.svg
    .selectAll("rect")
    .data(vis.averages)
  bar.enter()
    .append("rect")
    .attr("class", "rect")
    .merge(bar)
    .attr("x", function(d){ return vis.x(d.key) })
    .attr("y", function(d){ return vis.y(d.value) })
    .attr("width", vis.x.bandwidth())
    .attr("height", function(d) { return (vis.height - vis.y(d.value)) });
  bar.exit().remove();

 }
