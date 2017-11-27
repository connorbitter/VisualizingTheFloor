
/*
 * DefenderVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

DefenderVis = function(_parentElement, _data, _points){
	this.parentElement = _parentElement;
	this.data          = _data;
  this.points        = _points;

	this.filteredData  = this.data;

	this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

DefenderVis.prototype.initVis = function(){
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

	vis.extent = d3.extent(vis.data, function(d){return d.CLOSE_DEF_DIST});

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
	  .attr("transform", "translate(0," + vis.height + ")")

	vis.svg.append("g")
	  .attr("class", "axis y-axis")

	// Label Axes
	vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (-vis.margin.left / 1.5) + "," + (vis.height / 2) + ")rotate(-90)")
    .text("Shot Percentage")

	vis.svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (vis.width / 2) + "," + (vis.height - (vis.margin.bottom / 4)) + ")")
    .text("Defender Distance (ft)");

  // Title
  vis.svg.append("text")
        .attr("x", (vis.width / 2))
        .attr("y", 0 - (vis.margin.top / 10))
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text(vis.points + "-point Shots");

	// Line
	vis.line = d3.line();
	vis.svg.append("path")
	  .attr("class", "line");

	// (Filter, aggregate, modify data)
	vis.initData();
}

DefenderVis.prototype.initData = function(){
	var vis = this;

  console.log(vis.points);

	vis.filteredData = vis.filteredData.filter(function(element) {
		return element.PTS_TYPE == vis.points;
	});

	// Store shot percentages by distance (min. 10 shots)
	vis.percentages = {};

	for (i = vis.extent[0]; i < vis.extent[1] + 0.1; i += 0.1) {

		// Fix floating point error
		var i_r = (Math.round(i * 10) / 10);

		// Counters
		var shots_total = 0;
		var shots_made = 0;

		// Loop through all shots
		for (j = 0; j < vis.filteredData.length; j++) {
			if (vis.filteredData[j]['CLOSE_DEF_DIST'] == i_r) {
				shots_total++;
				shots_made += vis.filteredData[j]['FGM']
			}
		}

		if (shots_total >= 10)
			vis.percentages[i_r.toFixed(1)] = (shots_made / shots_total);
	}

	vis.data = vis.percentages;

	vis.extent = d3.extent(Object.keys(vis.data), function(d) {
		return +d;
	});

	// Slider
	vis.slider = document.getElementById("def-dist-slider");

	// Create slider based on data

  if (!slider_created) {
    noUiSlider.create(vis.slider, {
    start: vis.extent,
    step: 0.1,
    connect: true,
    tooltips: true,
    range: {
      'min': vis.extent[0],
      'max': vis.extent[1]
    }});

    slider_created = true
  }

	vis.slider.noUiSlider.on('update', function(values, handle) {
		vis.onSelectionChange();
	});
}

/*
 * Data wrangling
 */

DefenderVis.prototype.wrangleData = function(){
	var vis = this;

	vis.extent = d3.extent(Object.keys(vis.filteredData), function(d) {
		return +d;
	});

	vis.displayData = vis.filteredData;

	// Update the visualization
	vis.updateVis();
}

/*
 * The drawing function
 */

DefenderVis.prototype.updateVis = function(){
	var vis = this;

  vis.x.domain(vis.extent);
  vis.y.domain([0, 1]);

  // Update Axes
  vis.xAxis.scale(vis.x);
  vis.yAxis.scale(vis.y).tickFormat(function(d){return (d * 100) + "%"});

  d3.select("#" + vis.parentElement + " .x-axis")
    .transition()
    .duration(800)
    .call(vis.xAxis)

  d3.select("#" + vis.parentElement + " .y-axis")
    .transition()
    .duration(800)
    .call(vis.yAxis)

  // Update Line
  vis.line
    .x(function(d) { return vis.x(d); })
    .y(function(d) {
      if (isNaN(vis.displayData[d])) {
        return vis.y(0);
      }
      else {
        return vis.y(vis.displayData[d]);
      }
    });

  d3.select("#" + vis.parentElement + " .line")
    .attr("d", vis.line(Object.keys(vis.displayData)))
    .attr("class", "line")
    .attr("stroke", "#003DA5")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}


DefenderVis.prototype.onSelectionChange = function(){
	var vis = this;

	// Filter data depending on selected range
	var sliderRange = vis.slider.noUiSlider.get();

	vis.filteredData = {};

	for (var key in vis.data) {
		if (+key >= sliderRange[0] && +key <= sliderRange[1]) {
			vis.filteredData[key] = vis.data[key];
		}
	}

	vis.wrangleData();
}
