define([
	'classy'
],
function(Class) {
	var LevelManager = Class.$extend({
        levels: [
            'Level2',
            'Level1'
        ],
		__init__: function() {
			this.currentLevelId = null;
		},

        loadNextLevel: function(callback) {
			if (this.currentLevelId === null)
				this.currentLevelId = 0;
            else
                ++this.currentLevelId;

			return this.loadLevel(this.currentLevelId, callback);
		},

        loadLevel: function(levelId, callback) {
            var levelName = this.levels[levelId];

            if (_.isUndefined(levelName)) {
                callback({levelData: null});
                return; //game finished
            }

            var self = this;
            $.ajax({
                    type: 'GET',
                    url: 'levels',
                    data: {
                        name: levelName
                    },
                    dataType: 'json',
                    beforeSend: function() {
                    },
                    success: function(data) {
                        callback({
                            levelData: data
                        });
                    },
                    error: function(data) {
                        alert("Unable to load level");
                    }
            });
        }
	});

	return LevelManager;
});