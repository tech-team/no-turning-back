define([
	'game/models/player'
],
function(Player) {
	var Game = {
		FPS: 60,
		canvas: null,
		context: null,
		width: 300,
		height: 300,

		run: function (_canvas) {
			this.canvas = _canvas;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.context = _canvas.getContext("2d");
			
			var self = this;
			setInterval(function() {
				self.update();
				self.render();
			}, 1000 / this.FPS);
		},

		update: function() {

		},

		render: function() {
			this.context.fillRect(50, 50, 160, 160);
            
            for (i = 0; i < 8; i += 2)
                for (j = 0; j < 8; j += 2) {
                    this.context.clearRect(50 + i * 20, 50 + j * 20, 20, 20);
                    this.context.clearRect(50 + (i + 1) * 20, 50 + (j + 1) * 20, 20, 20);
                }
            

		}
	};

	return Game;
});