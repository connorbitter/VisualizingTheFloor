/*
 * BarChartVis - Object constructor function
 * @param _parentElement  -- the HTML element in which to draw the visualization
 * @param _data           -- the actual data
 */

BarChartVis = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data          = _data;

  this.filteredData  = this.data;

  this.initVis();
}

BarChartVis.prototype.initVis = function(){
  var vis = this;

  vis.margin = {top: 20, right: 20, bottom: 80, left: 100};

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

  // Set domains
  vis.x.domain(["All FGA", "League Avg FGA", "2PA", "League Avg 2PA", "3PA", "League Avg 3PA"]);
  vis.y.domain([0, 100]);

  // Draw Axes
  vis.svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + vis.height + ")");

  vis.svg.append("g")
    .attr("class", "axis y-axis");

// Label Axes
vis.svg.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", "translate("+ (-vis.margin.left / 2) + "," + (vis.height / 2) + ")rotate(-90)")
  .text("FG%");

  // Add Axes
  vis.xAxis.scale(vis.x);
  vis.yAxis.scale(vis.y).tickFormat(function(d){return d + "%"});

  d3.select("#" + vis.parentElement + " .x-axis")
    .transition()
    .duration(800)
    .call(vis.xAxis)

  d3.select("#" + vis.parentElement + " .y-axis")
    .transition()
    .duration(800)
    .call(vis.yAxis)

  // Title
  vis.svg.append("text")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 10))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("Player FG%");

  vis.dropdown = d3.select("#player-dropdown");
  $("#player-dropdown").change(function() {
    vis.wrangleData();
  });

  vis.team_dropdown = d3.select("#team-dropdown");
  $("#team-dropdown").change(function() {
    vis.wrangleData();
  });

  // Calculate league averages using entire dataset
  // Calculate player's overall FG%
  var makes = 0
  vis.data.forEach(function(d){
    makes += d.FGM;
  })
  if (vis.data.length == 0){
    var fg_pct = 0;
  }
  else {
    var fg_pct = 100 * (makes / vis.data.length);
  }

  // Calculate player's 2-pt FG%
  var twos = 0
  vis.data_2 = vis.data.filter(function(d){ return d.PTS_TYPE == 2 })
  vis.data_2.forEach(function(d){
    twos += d.FGM;
  })
  if (vis.data_2.length == 0){
    var two_pct = 0;
  }
  else {
    var two_pct = 100 * (twos / vis.data_2.length);
  }
  // Calculate player's 3-pt FG%
  var threes = 0
  vis.data_3 = vis.data.filter(function(d){ return d.PTS_TYPE == 3 })
  vis.data_3.forEach(function(d){
    threes += d.FGM;
  })
  if (vis.data_3.length == 0){
    var three_pct = 0;
  }
  else {
    var three_pct = 100 * (threes / vis.data_3.length);
  }
  vis.league_pcts = [{key: "League Avg FGA", value: fg_pct}, {key: "League Avg 2PA", value: two_pct}, {key: "League Avg 3PA", value: three_pct}];

  // Call next function
  vis.wrangleData();

}

BarChartVis.prototype.wrangleData = function(){
  var vis = this;

  // Get current player selection
  vis.player_selection = vis.dropdown.property("value");
  vis.team_selection = vis.team_dropdown.property("value");

  // Filter by current player or team
  vis.filteredData = vis.data.filter(function(element){
    if (vis.player_selection == "All") {
      return element.TEAM_NAME == vis.team_selection;
    }
    else {
      return element.PLAYER_NAME == vis.player_selection;
    }
  });

  vis.displayData = vis.filteredData;

  // Calculate player's overall FG%
  var makes = 0
  vis.filteredData.forEach(function(d){
    makes += d.FGM;
  })
  if (vis.filteredData.length == 0){
    var fg_pct = 0;
  }
  else {
    var fg_pct = 100 * (makes / vis.filteredData.length);
  }

  // Calculate player's 2-pt FG%
  var twos = 0
  vis.filteredData_2 = vis.filteredData.filter(function(d){ return d.PTS_TYPE == 2 })
  vis.filteredData_2.forEach(function(d){
    twos += d.FGM;
  })
  if (vis.filteredData_2.length == 0){
    var two_pct = 0;
  }
  else {
    var two_pct = 100 * (twos / vis.filteredData_2.length);
  }
  // Calculate player's 3-pt FG%
  var threes = 0
  vis.filteredData_3 = vis.filteredData.filter(function(d){ return d.PTS_TYPE == 3 })
  vis.filteredData_3.forEach(function(d){
    threes += d.FGM;
  })
  if (vis.filteredData_3.length == 0){
    var three_pct = 0;
  }
  else {
    var three_pct = 100 * (threes / vis.filteredData_3.length);
  }
  // vis.pcts = [{key: "All FGA", value: fg_pct}, {key: "2PA", value: two_pct}, {key: "3PA", value: three_pct}];

  vis.pcts = [{key: "All FGA", value: fg_pct}, vis.league_pcts[0], {key: "2PA", value: two_pct}, vis.league_pcts[1], {key: "3PA", value: three_pct}, vis.league_pcts[2]];

  vis.updateVis();
 }

BarChartVis.prototype.updateVis = function(){
  var vis = this;

  // Add bars
  var bar = vis.svg
    .selectAll("rect")
    .data(vis.pcts);
  bar.enter()
    .append("rect")
    .attr("class", "rect")
    .merge(bar)
    .transition()
    .attr("x", function(d){ return vis.x(d.key) + 10 })
    .attr("y", function(d){ return vis.y(d.value) })
    .attr("width", vis.x.bandwidth() - 20)
    .attr("height", function(d) { return (vis.height - vis.y(d.value)) });
  bar.exit().remove();

  var height = vis.svg
  .selectAll("text.heights")
    .data(vis.pcts);
    height.enter()
    .append("text")
    .attr("class", "heights")
    .merge(height)
    .transition()
    .text(function(d) {
        return (d.value.toFixed(1) + "%");
    })
    .attr("x", function(d) {
        return (vis.x(d.key) + vis.x.bandwidth()/6);
    })
    .attr("y", function(d, index) {
        return (vis.y(d.value) - 20);
    })
    height.exit().remove();
 }
