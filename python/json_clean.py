import json

data = json.load(open('data_cleaned.json'))
print(len(data))

# for element in data:
#     del element['MATCHUP']
#     del element['MINUTES_REMAINING']
#     del element['EVENT_TYPE']
#     del element['GRID_TYPE']
#    del element['player_name']
#     del element['SHOT_DISTANCE']
#     del element['SHOT_ATTEMPTED_FLAG']
#     del element['SHOT_MADE_FLAG']
#     del element['SHOT_RESULT']
#     del element['SHOT_TYPE']

# with open('data_cleaned.json', 'w') as outfile:
# 	json.dump(data, outfile)
