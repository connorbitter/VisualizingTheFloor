/*
 * ScatterPlotVis - Object constructor function
 * @param _parentElement  -- the HTML element in which to draw the visualization
 * @param _data           -- the actual data
 */

ScatterPlotVis = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data          = _data;

  this.filteredData  = this.data;

  this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

ScatterPlotVis.prototype.initVis = function(){
  var vis = this;

  vis.ctr = 0;

  vis.margin = {top: 20, right: 20, bottom: 60, left: 80};

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
  vis.height = 300 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    .attr("class", "shotchart-background");

  vis.y_extent = [0, d3.max(vis.data, function(d) {return d.Wins})];

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

  vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (-vis.margin.left / 2) + "," + (vis.height / 2) + ")rotate(-90)")
    .text("Wins")

  // Create stat dropdown
  vis.statDropdown = d3.select("#stat-dropdown");
  vis.keys = Object.keys(vis.data[0]);
  var sel = document.getElementById('stat-dropdown');
  for(var i = 0; i < vis.keys.length; i++) {
    if (vis.keys[i] != "AFG% (Adjusted Field Goal)"  && vis.keys[i] != "TEAM" && vis.keys[i] != "Wins" && vis.keys[i] != "Losses") {
      var opt = document.createElement('option');
      opt.innerHTML = vis.keys[i];
      opt.value = vis.keys[i];
      sel.appendChild(opt);
    }
  };

  $("#stat-dropdown").change(function() {
    vis.wrangleData();
  });

  // Get ranks for each stat
  vis.ranks = {}
  for (var i = 0; i < vis.keys.length; i++) {
    var temp = vis.filteredData.slice()
    vis.ranks[vis.keys[i]] = temp.sort(function(x, y){
      return x[vis.keys[i]] - y[vis.keys[i]];
    });
  };

  // Use d3-tip
  vis.tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10,0])

  // Call next function
  vis.wrangleData();

 }

ScatterPlotVis.prototype.wrangleData = function(){
  var vis = this;

  vis.selectedStat = vis.statDropdown.property("value");

  vis.displayData = vis.filteredData;

  // Create arrays to rank for wins and selected stat
  vis.winsSorted = vis.displayData.slice()
  vis.winsSorted.sort(function(x, y){
   return x['Wins'] - y['Wins'];
  });

  vis.selectedStatSorted = vis.displayData.slice()
  vis.selectedStatSorted.sort(function(x, y){
   return d3.ascending(x[vis.selectedStat], y[vis.selectedStat]);
  });

  vis.updateVis();
}

ScatterPlotVis.prototype.updateVis = function(){
  var vis = this;

  vis.x_extent = d3.extent(vis.displayData, function(d){ return d[vis.selectedStat]; })

  vis.x.domain(vis.x_extent);
  vis.y.domain(vis.y_extent);

  var circle = vis.svg
    .selectAll("circle")
    .data(vis.displayData);

    var t = d3.transition()
      .duration(1000)
      .ease(d3.easeCubicInOut);

  circle.enter()
    .append("circle")
    .attr("class", "circle")
    .attr("fill", function(d){
      if (d.TEAM == "Golden State Warriors"){ return teamColors[d.TEAM]['mainColor']['hex']; }
      else { return "#141115"; }
    })
    // .on("mouseover", function(d) {
    //   d3.select(this).style("fill", function(d2) {
    //     return teamColors[d.TEAM]['mainColor']['hex']
    //   })
    // })
    .on("mouseover", vis.tip.show)
    .on("mouseout", vis.tip.hide)
    // .on("mouseout", function(d) {
    //   d3.select(this).style("fill", function(d2) {
    //     if (d.TEAM == "Golden State Warriors"){ return teamColors[d.TEAM]['mainColor']['hex']; }
    //     else { return "#141115"; }
    //   })
    // })
    .on("click", function(d) {showTable(d)})
    .merge(circle)
    .transition(t)
    .attr("r", 4)
    .attr("cx", function(d){ return vis.x(d[vis.selectedStat]) })
    .attr("cy", function(d){ return vis.y(d.Wins) });
    circle.exit().remove();

  vis.xAxis.scale(vis.x)
    .tickFormat(function(d){
      if (vis.selectedStat == "FG%" || vis.selectedStat == "3P%" || vis.selectedStat == "FT%" || vis.selectedStat == "AFG% (Adjusted Field Goal)") {
        return ((d * 100).toFixed() + "%");
      }
      else { return d; }
    })
    .ticks(8);

  vis.yAxis.scale(vis.y)
    .ticks(8);

  var t = d3.transition()
    .duration(500)
    .ease(d3.easeLinear);

  d3.select("#" + vis.parentElement + " .x-axis")
    .transition(t)
    .call(vis.xAxis);

  d3.select("#" + vis.parentElement + " .y-axis")
    .transition(t)
    .call(vis.yAxis);

  d3.select("#temp-text").remove();

  vis.svg.append("text")
    .attr("id", "temp-text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (vis.width / 2) + "," + (vis.height + 40) + ")")
    .text(vis.selectedStat);

  // Tooltips
  vis.tip
    .html(function(d) {

      // Get ranks
      var winsRank = 30 - (vis.ranks['Wins'].findIndex(function(e) {
        return e.TEAM == d.TEAM;
      }))
      var selectedStatRank = 30 - (vis.ranks[vis.selectedStat].findIndex(function(e) {
        return e.TEAM == d.TEAM;
      }))

      // Create tooltip
      return '<div class="tooltip-team">' + d.TEAM + '</div><table class="table table-sm tooltip-table"><tr><td class="tooltip-stat">' + vis.selectedStat + '</td><td>' + d[vis.selectedStat] + '</td><td>Rank</td><td>' + selectedStatRank + '</td></tr><tr><td>Wins</td><td>' + d['Wins'] + '</td><td>Rank</td><td>' + winsRank + '</td></tr>';
    });
  vis.svg.call(vis.tip);

  // Find rank given team name and statistic
  function findRank(team, stat){
    var rank = 30 - (vis.ranks[stat].findIndex(function(e) {
        return e.TEAM == team;
    }))

    return rank
  }

  // Show details for a specific team and Warriors when clicked
  function showTable(d){
    $("#table-team").html(d.TEAM);
    $("#table-record").html(d['Wins'] + ' - ' + (82 - d['Wins']));
    $("#table-record-rank").html(findRank(d.TEAM, 'Wins'));

    $("#table-selected-stat").html(vis.selectedStat);
    $("#table-stat").html(d[vis.selectedStat]);
    $("#table-stat-rank").html(findRank(d.TEAM, vis.selectedStat));

    // Get Golden State's object
    var goldenStateIndex = vis.filteredData.findIndex(function(e) {
      return e.TEAM == 'Golden State Warriors'
    });

    $("#gsw-record").html(vis.displayData[goldenStateIndex]['Wins'] + ' - ' + (82 - vis.displayData[goldenStateIndex]['Wins']));
    $("#gsw-record-rank").html(findRank('Golden State Warriors', 'Wins'));
    $("#gsw-stat").html(vis.displayData[goldenStateIndex][vis.selectedStat]);
    $("#gsw-stat-rank").html(findRank('Golden State Warriors', vis.selectedStat));

    $("#scatter-table").css("display", "table")
  }

  // Add linear regression line
  // Taken from https://bl.ocks.org/ctufts/298bfe4b11989960eeeecc9394e9f118
  function create_data(d) {
    var x = [];
    var y = [];
    d.forEach(function(ele){
      x.push(ele[vis.selectedStat])
      y.push(ele.Wins)
    });
    var n = x.length;
    var x_mean = 0;
    var y_mean = 0;
    var term1 = 0;
    var term2 = 0;

    for (var i = 0; i < n; i++) {
        x_mean += x[i]
        y_mean += y[i]
    }

    x_mean /= n;
    y_mean /= n;

    var xr = 0;
    var yr = 0;
    for (i = 0; i < x.length; i++) {
        xr = x[i] - x_mean;
        yr = y[i] - y_mean;
        term1 += xr * yr;
        term2 += xr * xr;

    }

    var b1 = term1 / term2;
    var b0 = y_mean - (b1 * x_mean);

    var yhat = [];
    for (i = 0; i < x.length; i++) {
        yhat.push(b0 + (x[i] * b1));
    }

    var data = [];
    for (i = 0; i < y.length; i++) {
        data.push({
            "yhat": +yhat[i],
            "y": +y[i],
            "x": +x[i]
        })
    }
    return (data);
  }

  var regressionData = create_data(vis.displayData);

  var newline = d3.line()
      .x(function(d) {
          return vis.x(d.x);
      })
      .y(function(d) {
          return vis.y(d.yhat);
      });

  if (vis.ctr == 0){
    vis.svg.append("path")
        .datum(regressionData)
        .attr("clip-path", "url(#" + vis.parentElement + ")")
        .attr("class", "regression-line")
        .attr("d", newline);
  }

  var t = d3.transition()
    .duration(100)
    .ease(d3.easeLinear);

  vis.svg.select("path.regression-line")
            .datum(regressionData)
            .transition(t)
            .attr("d", newline);

  vis.ctr += 1;
}
