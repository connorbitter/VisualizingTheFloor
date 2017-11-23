// (1) Load data asynchronously
queue()
	.defer(d3.json,"data/shot_locations.json")
	.defer(d3.csv,"data/defender_stats.csv")
	.await(createVis);


function createVis(error, shot_locations, defender_stats){
  // Separate shots and league averages
  var shots = shot_locations.resultSets[0].rowSet;
  var averages = shot_locations.resultSets[1].rowSet;

  // Process shots
  shots.forEach(function(d) {
    d[1] = +d[1];
    d[21] = +d[21];
    d.GRID_TYPE = d[0];
    d.GAME_ID = d[1];
    d.GAME_EVENT_ID = d[2];
    d.PLAYER_ID = d[3];
    d.PLAYER_NAME = d[4];
    d.TEAM_ID = d[5];
    d.TEAM_NAME = d[6];
    d.PERIOD = d[7];
    d.MINUTES_REMAINING = d[8];
    d.SECONDS_REMAINING = d[9];
    d.EVENT_TYPE = d[10];
    d.ACTION_TYPE = d[11];
    d.SHOT_TYPE = d[12];
    d.SHOT_ZONE_BASIC = d[13];
    d.SHOT_ZONE_AREA = d[14];
    d.SHOT_ZONE_RANGE = d[15];
    d.SHOT_DISTANCE = d[16];
    d.LOC_X = d[17];
    d.LOC_Y = d[18];
    d.SHOT_ATTEMPTED_FLAG = d[19];
    d.SHOT_MADE_FLAG = d[20];
    d.GAME_DATE = d[21];
    d.HTM = d[22];
    d.VTM = d[23];
    for (var key = 0; key < 24; key++) {
      delete d[key];
    }
  });

  // Process defender_stats
  defender_stats.forEach(function(d) {
    d.CLOSEST_DEFENDER_PLAYER_ID = +d.CLOSEST_DEFENDER_PLAYER_ID;
    d.CLOSE_DEF_DIST = +d.CLOSE_DEF_DIST;
    d.DRIBBLES = +d.DRIBBLES;
    d.FGM = +d.FGM;
    d.FINAL_MARGIN = +d.FINAL_MARGIN;
    d.GAME_ID = +d.GAME_ID;
    d.PERIOD = +d.PERIOD;
    d.PTS = +d.PTS;
    d.PTS_TYPE = +d.PTS_TYPE;
    d.SHOT_CLOCK = +d.SHOT_CLOCK;
    d.SHOT_DIST = +d.SHOT_DIST;
    d.SHOT_NUMBER = +d.SHOT_NUMBER;
    d.TOUCH_TIME = +d.TOUCH_TIME;
    d.PLAYER_ID = +d.player_id;
    delete d.player_id;
    d.MINUTES_REMAINING = +d.GAME_CLOCK.split(":")[0];
    d.SECONDS_REMAINING = +d.GAME_CLOCK.split(":")[1];
  });

  // Initialize counter to track progress and array to store data
  var ctr = 0;
  var mergedData = [];

  // Check for matches between data and merge
  for (var i = 0; i < shots.length; i++) {
    var filtered = defender_stats.filter(function(d) {
    return (d.PLAYER_ID == shots[i].PLAYER_ID && d.GAME_ID ==
            shots[i].GAME_ID && d.PERIOD == shots[i].PERIOD &&
            d.MINUTES_REMAINING == shots[i].MINUTES_REMAINING  &&
            Math.abs(d.SECONDS_REMAINING - shots[i].SECONDS_REMAINING) <= 5);
    });
    if (filtered.length == 1) {
      ctr += 1;
      mergedData.push($.extend(filtered[0], shots[i]));
    };
  };

  var dbx = new Dropbox({ accessToken: 'ACCESS TOKEN HERE' });
  dbx.filesUpload({path: '/data.json', contents: JSON.stringify(mergedData)})
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
}
