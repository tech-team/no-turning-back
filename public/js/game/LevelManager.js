define([
	'classy'
],
function(Class) {
	var LevelManager = Class.$extend({
		__init__: function(loadedCallback, onLoadedContext) {
			this.currentLevelId = null;
            this.campaigns = [];
            this.activeCampaign = null;
            this.levels = [];

            var self = this;
            $.ajax({
                type: 'GET',
                url: 'levels/campaigns',
                dataType: 'json',
                beforeSend: function() {
                },
                success: function(data) {
                    self.campaigns = data;
                    self.campaignPicker(loadedCallback, onLoadedContext);
                },
                error: function(data) {
                    alert("Unable to load level. Error: " + data);
                }
            });
		},

        campaignPicker: function(loadedCallback, onLoadedContext) {
            var randId = Math.floor((Math.random() * this.campaigns.length));
            this.activeCampaign = this.campaigns[randId];

            var self = this;
            $.ajax({
                type: 'GET',
                url: 'levels/campaigns/' + this.activeCampaign.campaign,
                dataType: 'json',
                beforeSend: function() {
                },
                success: function(data) {
                    self.levels = data;
                    loadedCallback.call(onLoadedContext);
                },
                error: function(data) {
                    alert("Unable to load level. Error: " + data);
                }
            });
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