
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

  vis.margin = {top: 20, right: 20, bottom: 40, left: 80};

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

  // Label Axes
  vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (-vis.margin.left / 1.5) + "," + (vis.height / 2) + ")rotate(-90)")
    .text("Y Location");

  vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (vis.width / 2) + "," + vis.height + ")")
    .text("X Location");

  // Title
  vis.svg.append("text")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 10))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("Shot Chart");

  // Get list of all players that recorded a shot
  var unique = {};
  var players = [];
  for (var i=0; i < vis.data.length; i++){
   if(typeof(unique[vis.data[i].PLAYER_NAME]) == "undefined"){
    players.push(vis.data[i].PLAYER_NAME);
   }
   unique[vis.data[i].PLAYER_NAME] = 0;
  }

  // Function to sort players by last name
  function compare(a, b) {
    var splitA = a.split(" ");
    var splitB = b.split(" ");
    var lastA = splitA[splitA.length - 1];
    var lastB = splitB[splitB.length - 1];

    if (lastA < lastB) return -1;
    if (lastA > lastB) return 1;
    return 0;
  }
  players = players.sort(compare);

  // Add players as selectbox options
  var sel = document.getElementById('player-dropdown');
  for(var i = 0; i < players.length; i++) {
      var opt = document.createElement('option');
      opt.innerHTML = players[i];
      opt.value = players[i];
      sel.appendChild(opt);
  }

  // Call next function
  vis.wrangleData();

 }

 ShotChartVis.prototype.wrangleData = function(){
    var vis = this;

    // Get current player selection
    vis.dropdown = d3.select("#player-dropdown");
    vis.selection = vis.dropdown.property("value");

    console.log(vis.selection);

    // Filter by current player
    vis.filteredData = vis.filteredData.filter(function(element){
      return element.PLAYER_NAME == vis.selection;
    });

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
      .attr("r", 3)
      .attr("cx", function(d){
        return vis.x(d.LOC_X) })
      .attr("cy", function(d){ return vis.y(d.LOC_Y) })
      .attr("fill", function(d){
        if (d.FGM) { return "green" }
        else { return "red" }
      });
      circle.exit().remove();

    // Wrangle again if selection changes
    //vis.dropdown.on("change", vis.wrangleData());
 }
