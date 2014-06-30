define([
	'classy',
    'alertify'
],
function(Class, alertify) {
	var LevelManager = Class.$extend({
		__init__: function(loadedCallback) {
			this.currentLevelId = null;
            this.campaigns = [];
            this.activeCampaign = null;
            this.levels = [];

            var desiredCampaign = "First Era";

            var self = this;
            $.ajax({
                type: 'GET',
                url: 'levels/campaigns',
                dataType: 'json',
                beforeSend: function() {
                },
                success: function(data) {
                    self.campaigns = data;

                    self.activeCampaign = self.campaignPicker(desiredCampaign);
                    self.levels = self.activeCampaign.levels;
                    loadedCallback();
                },
                error: function(data) {
                    alertify.alert("Unable to campaigns list. Error: " + JSON.stringify(data));
                }
            });
		},

        campaignPicker: function(desiredCampaign) {
            return _.find(this.campaigns, function (c) {
                return c.campaign === desiredCampaign;
            });

//            var randId = Math.floor((Math.random() * this.campaigns.length));


//            var self = this;
//            $.ajax({
//                type: 'GET',
//                url: 'levels/campaigns/' + this.activeCampaign.campaign,
//                dataType: 'json',
//                beforeSend: function() {
//                },
//                success: function(data) {
//                    self.levels = data;
//                    loadedCallback();
//                },
//                error: function(data) {
//                    alertify.alert("Unable to campaign's levels list. Error: " + JSON.stringify(data));
//                }
//            });
        },

        isLastLevel: function() {
            return this.levels.length == this.currentLevelId + 1;
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

            this.loadLevelByName(levelName, callback);
        },

        loadLevelByName: function(levelName, callback) {
            if (_.isUndefined(levelName)) {
                callback(null);
                return;
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
                    callback(data);
                },
                error: function(data) {
                    callback(null);
                }
            });
        },

        isLevelExists: function(levelName, callback) {
            $.ajax({
                type: 'GET',
                url: 'levels/exists',
                data: {name: levelName},
                dataType: 'json',
                success: callback,
                error: callback.bind(null)
            });
        },

        saveLevel: function(data, callback) {
            $.ajax({
                type: 'POST',
                url: 'levels',
                data: {
                    name: data.name,
                    data: JSON.stringify(data)
                },
                success: function(data) {
                    callback(true);
                },
                error: function(data) {
                    callback(null);
                }
            });
        }
	});

	return LevelManager;
});