define([
	'classy',
	'game/AliveObject',
    'game/KeyCoder',
    'collision'
],
function(Class, AliveObject, KeyCoder, ndgmr) {
	var Player = AliveObject.$extend({
		__init__: function() {
            this.health = 100;
			this.score = 0;
            this.cooldown = 0;
		},

		update: function(event) {

        }
	});

	return Player;
});