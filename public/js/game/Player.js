define([
	'classy',
	'game/AliveObject'
],
function(Class, AliveObject) {
	var Player = AliveObject.$extend({
		__init__: function() {
			this.score = 0;
		},

		update: function(event) {
			
		}
	});

	return Player;
});