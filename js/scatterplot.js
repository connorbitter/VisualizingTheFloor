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

  vis.margin = {top: 20, right: 20, bottom: 40, left: 80};

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
    if (vis.keys[i] != "PTS"  && vis.keys[i] != "TEAM" && vis.keys[i] != "Wins" && vis.keys[i] != "Losses") {
      var opt = document.createElement('option');
      opt.innerHTML = vis.keys[i];
      opt.value = vis.keys[i];
      sel.appendChild(opt);
    }
  };

  $("#stat-dropdown").change(function() {
    vis.wrangleData();
  });

  // Use d3-tip
  vis.tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10,0])
      .html(function(d) { return d.TEAM ; });
  vis.svg.call(vis.tip);

  // Call next function
  vis.wrangleData();

 }

ScatterPlotVis.prototype.wrangleData = function(){
  var vis = this;

  vis.selectedStat = vis.statDropdown.property("value");

  vis.displayData = vis.filteredData;

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
    .merge(circle)
    .transition(2000)
    .attr("r", 4)
    .attr("cx", function(d){ return vis.x(d[vis.selectedStat]) })
    .attr("cy", function(d){ return vis.y(d.Wins) });
    circle.exit().remove();

  vis.xAxis.scale(vis.x).tickFormat(function(d){
    if (vis.selectedStat == "FG%" || vis.selectedStat == "3P%" || vis.selectedStat == "FT%" || vis.selectedStat == "AFG%") {
      return ((d * 100).toFixed() + "%");
    }
    else { return d; }
  });
  vis.yAxis.scale(vis.y);

  d3.select("#" + vis.parentElement + " .x-axis")
    .transition(2000)
    .call(vis.xAxis);

  d3.select("#" + vis.parentElement + " .y-axis")
    .transition(2000)
    .call(vis.yAxis);

  d3.select("#temp-text").remove();

  vis.svg.append("text")
    .attr("id", "temp-text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (vis.width / 2) + "," + (vis.height + vis.margin.bottom) + ")")
    .text(vis.selectedStat);

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

  vis.svg.select("path.regression-line")
            .datum(regressionData)
            .transition()
            .attr("d", newline);

  vis.ctr += 1;
}
