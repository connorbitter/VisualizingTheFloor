# VisualizingTheFloor

## Code Overview by folder:

* css:
	* nouislider.min.css: library code
	* style.css: our own stylesheet
* data:
	* 14-15-defense-pergame.csv: stats from http://www.espn.com/nba/statistics/team/_/stat/defense-per-game/year/2015 and averages for aggregated data from other datasets below
	* 14-15-pergame.csv: stats from http://www.espn.com/nba/statistics/team/_/stat/offense-per-game/year/2015 and averages for aggregated data from other datasets below
	* data_cleaned.json: retains only necessary stats from data_full.json
	* data_full.json: aggregated data from defender_stats.csv and shot_locations.json
	* defender_stats.csv: defender data from Kaggle (https://www.kaggle.com/dansbecker/nba-shot-logs)
	* shot_locations.json: location data from NBA.com API (http://stats.nba.com/)
	* team_colors.json: colors for every team in the nba
* images:
	* logos: team logos for every team in the nba
	* Other files: images used on site
* js:
	* barchartvis.js: code for the bar chart attached to the shot chart visualization
	* bootstrap.min.js: library code
	* d3-tip.js: library code
	* d3.js: library code
	* defendervis.js: code for line charts about defender distance
	* defensescatterplotvis.js: code for the scatter plot about defensive stats
	* jquery.counterup.min.js: library code
	* jquery.min.js: library code
	* jquery.waypoints.min.js: library code
	* linechartvis.js: code for the other line charts
	* main.js: main js file that loads data and creates all visualizations
	* nouislider.min.js: library code
	* openshotvis.js: code for bar chart that we are not using
	* queue.min.js: library code
	* scatterplotvis.js: code for the first scatter plot
	* shotchartvis.js: code for the shot chart visualization
	* wrangle_data.js: code for aggregating the Kaggle and NBA data including pushing a file to Dropbox
* python:
	* json_clean.py: code for cleaning json files (removing unused columns to reduce data file sizes)
* .gitignore: files to ignore for github
* index.html: main website page
* index.sublime-workspace: file for sublime text server
* wrangle.html: placeholder html page for calling the data wrangling javascript code