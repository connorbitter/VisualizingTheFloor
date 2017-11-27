
/*
 * ShotChartVis - Object constructor function
 * @param _parentElement  -- the HTML element in which to draw the visualization
 * @param _data           -- the actual data
 */

ShotChartVis = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data          = _data;

  this.filteredData  = this.data;

  this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

 ShotChartVis.prototype.initVis = function(){
  var vis = this;

  vis.margin = {top: 20, right: 20, bottom: 40, left: 20};

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
  vis.height = 300 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x_extent = d3.extent(vis.data, function(d) {return d.LOC_X});
  vis.y_extent = d3.extent(vis.data, function(d) {return d.LOC_Y});

  // Scales
  vis.x = d3.scaleLinear()
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

  // // Label Axes
  // vis.svg.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("transform", "translate("+ (-vis.margin.left / 1.5) + "," + (vis.height / 2) + ")rotate(-90)")
  //   .text("Y Location");

  // vis.svg.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("transform", "translate("+ (vis.width / 2) + "," + vis.height + ")")
  //   .text("X Location");

  // Get list of all players that recorded a shot
  var unique = {};
  vis.players = [];
  for (var i = 0; i < vis.data.length; i++){
   if(typeof(unique[vis.data[i].PLAYER_NAME]) == "undefined") {
    vis.players.push([vis.data[i].PLAYER_NAME, vis.data[i].TEAM_NAME]);
   }

   unique[vis.data[i].PLAYER_NAME] = 0;
  }

  // Get list of all teams that recorded a shot
  var unique2 = {};
  vis.teams = [];
  for (var i = 0; i < vis.data.length; i++){
   if(typeof(unique2[vis.data[i].TEAM_NAME]) == "undefined"){
    vis.teams.push(vis.data[i].TEAM_NAME);
   }
   unique2[vis.data[i].TEAM_NAME] = 0;
  };

  // Function to sort players by last name
  // function compare(a, b) {
  //   var splitA = a.split(" ");
  //   var splitB = b.split(" ");
  //   var lastA = splitA[splitA.length - 1];
  //   var lastB = splitB[splitB.length - 1];

  //   if (lastA < lastB) return -1;
  //   if (lastA > lastB) return 1;
  //   return 0;
  // }
  // players = players.sort(compare);
  vis.teams = vis.teams.sort();


  // Create team dropdown
  vis.teamDropdown = d3.select("#team-dropdown");
  var sel = document.getElementById('team-dropdown');
  for(var i = 0; i < vis.teams.length; i++) {
    if (vis.teams[i] != "Golden State Warriors") {
      var opt = document.createElement('option');
      opt.innerHTML = vis.teams[i];
      opt.value = vis.teams[i];
      sel.appendChild(opt);
    }
  }

  // Create player dropdown
  vis.playerDropdown = d3.select("#player-dropdown");
  vis.playerDropdown.innerHTML = '<option value="All" selected="selected">All</option>'

  vis.teamPlayers = vis.players.filter(function(d) {
    return d[1] == vis.teamDropdown.property("value");
  });

  var sel = document.getElementById('player-dropdown');
  for (var i = 0; i < vis.teamPlayers.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = vis.teamPlayers[i][0];
    opt.value = vis.teamPlayers[i][0];
    sel.appendChild(opt);
  }


  vis.teamDropdown.on("change", function() {

    // Change the players in the dropdown based on team selected
    var sel = document.getElementById('player-dropdown');

    sel.innerHTML = '<option value="All" selected="selected">All</option>'

    vis.teamPlayers = vis.players.filter(function(d) {
      return d[1] == vis.teamDropdown.property("value");
    });

    for(var i = 0; i < vis.teamPlayers.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = vis.teamPlayers[i][0];
        opt.value = vis.teamPlayers[i][0];
        sel.appendChild(opt);
    }

    vis.wrangleData();
  });

  vis.playerDropdown.on("change", function() {
    vis.wrangleData();
  });

  // Title
  vis.svg.append("text")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 10))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .attr("fill", function() {
          selectedTeam = vis.teamDropdown.property("value")
          return "black"
        })
        .text(function() {return vis.teamDropdown.property("value")});

  // Call next function
  vis.wrangleData();

 }

 ShotChartVis.prototype.wrangleData = function(){
    var vis = this;

    // Get current team selection
    vis.teamSelection = vis.teamDropdown.property("value");

    // Filter by current team
    vis.filteredData = vis.data.filter(function(element){
        return element.TEAM_NAME == vis.teamSelection;
    });

    // Get current player selection
    vis.playerSelection = vis.playerDropdown.property("value");

    // Filter by current player if one is selected
    if (vis.playerSelection != "All") {
      vis.filteredData = vis.filteredData.filter(function(element){
        return element.PLAYER_NAME == vis.playerSelection;
      });
    }

    vis.displayData = vis.filteredData;

    vis.updateVis();
 }

 ShotChartVis.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain(vis.x_extent);
    vis.y.domain(vis.y_extent);

    var circle = vis.svg
      .selectAll("circle")
      .data(vis.displayData);
    circle.enter()
      .append("circle")
      .attr("class", "circle")
      .merge(circle)
      .attr("r", 2)
      .attr("cx", function(d){ return vis.x(d.LOC_X) })
      .attr("cy", function(d){ return vis.y(d.LOC_Y + 20) })
      // .attr("stroke", "black")
      .attr("fill", function(d){
        if (d.FGM) { return "blue" }
        else { return "red" }
      });
      circle.exit().remove();
 }
