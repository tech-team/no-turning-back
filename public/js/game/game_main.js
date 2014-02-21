define([
	'game/models/player'
],
function(Player) {
	var Game = {
		FPS: 60,

		run: function ($canvas) {
			setInterval(function() {

			}, 1000 / this.FPS);
		},

		update: function() {

		},

		render: function() {

		}
	};

	return Game;
});