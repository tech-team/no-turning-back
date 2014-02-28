define([
	'classy'
],
function(Class) {
	var LevelManager = Class.$extend({
		__init__: function() {
			this.currentLevelId = null;
		},

		update: function(event) {
			
		},

		getLevel: function(levelId) {
			return this.loadLevel(levelId);
		},

		getNextLevel: function() {
			if (this.currentLevelId === null) {
				this.currentLevelId = 0;
			}
			++this.currentLevelId;
			return loadLevel(this.currentLevelId);
		},

		loadLevel: function(levelId) {
			// TODO: load a level over the Internet
			return this.dummyLevel;
		},

		dummyLevel: {

		}
	});

	return LevelManager;
});