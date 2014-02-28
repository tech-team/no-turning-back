define([
	'classy',
	'game/AliveObject'
],
function(Class, GameObject) {
	var Player = AliveObject.$extend({
		__init__: function() {
			this.score = 0;
		},

		update: function(event) {
			
		}
	});

	return Player;
});