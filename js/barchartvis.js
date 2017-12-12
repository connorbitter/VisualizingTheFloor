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

  vis.margin = {top: 20, right: 10, bottom: 20, left: 10};

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
  vis.height = 350 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Scales
  vis.xGroup = d3.scaleBand()
                    .domain(["All FGA", "2PA", "3PA"])
                    .range([0, vis.width])
                    .padding(0.15);


  vis.x = d3.scaleBand()
      .domain(["Selected", "Golden State", "League"])
      .range([0, vis.xGroup.bandwidth()])
      .paddingInner(0.02);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  // Axes
  vis.xAxis = d3.axisBottom();
  vis.yAxis = d3.axisLeft();

  // Set domains
  // vis.x.domain(["All FGA", "League Avg FGA", "2PA", "League Avg 2PA", "3PA", "League Avg 3PA"]);
  vis.y.domain([0, 70]);

  // Draw Axes
  vis.svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + vis.height + ")");

  // vis.svg.append("g")
  //   .attr("class", "axis y-axis");

  // Add Axes
  vis.xAxis.scale(vis.xGroup);
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
        .text("Field Goal %");

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
  var makes = 0;
  var gs_makes = 0;
  var gs_shots = 0;
  vis.data.forEach(function(d){
    makes += d.FGM;
    if (d.TEAM_NAME == "Golden State Warriors") {
      gs_makes += d.FGM;
      gs_shots += 1;
    }
  })
  if (vis.data.length == 0){
    var fg_pct = 0;
    var gs_fg_pct = 0;
  }
  else {
    var fg_pct = 100 * (makes / vis.data.length);
    var gs_fg_pct = 100 * (gs_makes / gs_shots);
  }

  // Calculate player's 2-pt FG%
  var twos = 0;
  var gs_twos = 0;
  var gs_twos_shots = 0;
  vis.data_2 = vis.data.filter(function(d){ return d.PTS_TYPE == 2 })
  vis.data_2.forEach(function(d){
    twos += d.FGM;
    if (d.TEAM_NAME == "Golden State Warriors") {
      gs_twos += d.FGM;
      gs_twos_shots += 1;
    }
  })
  if (vis.data_2.length == 0){
    var two_pct = 0;
    var gs_two_pct = 0;
  }
  else {
    var two_pct = 100 * (twos / vis.data_2.length);
    var gs_two_pct = 100 * (gs_twos / gs_twos_shots);
  }
  // Calculate player's 3-pt FG%
  var threes = 0;
  var gs_threes = 0;
  var gs_threes_shots = 0;
  vis.data_3 = vis.data.filter(function(d){ return d.PTS_TYPE == 3 })
  vis.data_3.forEach(function(d){
    threes += d.FGM;
    if (d.TEAM_NAME == "Golden State Warriors") {
      gs_threes += d.FGM;
      gs_threes_shots += 1;
    }
  })
  if (vis.data_3.length == 0){
    var three_pct = 0;
    var gs_three_pct = 0;
  }
  else {
    var three_pct = 100 * (threes / vis.data_3.length);
    var gs_three_pct = 100 * (gs_threes / gs_threes_shots);
  }
  vis.league_pcts = [{group: "All FGA", bar: "League", value: fg_pct}, {group: "2PA", bar:"League", value: two_pct}, {group: "3PA", bar: "League", value: three_pct}];
  vis.gs_pcts = [{group: "All FGA", bar: "Golden State", value: gs_fg_pct}, {group: "2PA", bar:"Golden State", value: gs_two_pct}, {group: "3PA", bar: "Golden State", value: gs_three_pct}];

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

  vis.pcts = [{group: "All FGA", bar:"Selected", value: fg_pct}, vis.gs_pcts[0], vis.league_pcts[0], {group: "2PA", bar: "Selected", value: two_pct}, vis.gs_pcts[1], vis.league_pcts[1], {group: "3PA", bar:"Selected", value: three_pct}, vis.gs_pcts[2], vis.league_pcts[2]];

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
    .attr("transform", function(d) {
      console.log(d.group);
      return "translate(" + vis.xGroup(d.group) + ",0)";
    })
    .attr("x", function(d){
      return vis.x(d.bar);
    })
    .attr("y", function(d){ return vis.y(d.value) })
    .attr("width", vis.x.bandwidth())
    .attr("height", function(d) { return (vis.height - vis.y(d.value)) })
    .attr("fill", function(d, index) {
      vis.teamDropdown = d3.select("#team-dropdown");
      if (index % 3 == 0) {
        selectedTeam = vis.teamDropdown.property("value")
        return teamColors[selectedTeam]["mainColor"]["hex"]
      }
      else if (index % 3 == 1) {
        return "#003DA5"
      }
      else {
        return "#DEC5E3"
      }
    });
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
    .attr("transform", function(d) {
      return "translate(" + vis.xGroup(d.group) + ",0)";
    })
    .attr("x", function(d) {
        return (vis.x(d.bar) + 3);
    })
    .attr("y", function(d, index) {
        return (vis.y(d.value) - 5);
    })
    height.exit().remove();

  var label2 = vis.svg
  .selectAll("text.label2")
    .data(vis.pcts);
    height.enter()
    .append("text")
    .attr("class", "label2")
    .merge(label2)
    .transition()
    .text(function(d, i) {
        if (i % 3 == 1) {
          return "GSW";
        }
        else if (i % 3 == 2) {
          return "NBA";
        }
    })
    .attr("transform", function(d) {
      return "translate(" + vis.xGroup(d.group) + ",0)";
    })
    .attr("x", function(d) {
        return (vis.x(d.bar) + 7);
    })
    .attr("y", function(d, index) {
        return (vis.y(d.value) + 15);
    })
    label2.exit().remove();
 }
