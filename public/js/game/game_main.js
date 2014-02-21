define([
	'game/models/player'
],
function(Player) {
	var Game = {
		FPS: 60,
		canvas: null,

		run: function (_canvas) {
			this.canvas = _canvas.getContext("2d");
			var self = this;
			setInterval(function() {
				self.update();
				self.render();
			}, 1000 / this.FPS);
		},

		update: function() {

		},

		render: function() {
			this.canvas.fillRect(0, 0, 50, 50);
		}
	};

	return Game;
});