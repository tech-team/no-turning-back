define([
	'classy',
	'game/models/player'
],
function(Class, Player) {
	var Game = Class.$extend({
		__init__: function(_scene, _canvas) {
			this.FPS = 60;
			this.scene = _scene;
			this.canvas = _canvas;
			this.context = _canvas.getContext("2d");
			this.width = 0;
			this.height = 0;

			this.calcDimensions();
		},
		
		calcDimensions: function() {
			if (this.scene === null) {
				console.log("#scene is null");
				return;
			}

			var self = this;
			$(window).resize(function() {
				var horizontalMargin = 50;
				var verticalMargin = 20;
				self.width = $(this).width() - 2 * horizontalMargin;
				self.height = $(this).height() - 2 * verticalMargin;
				var cssSizes = {
					'width': self.width + "px",
					'height' : self.height + "px"
				};
				self.scene.css(cssSizes).css({'margin-top': verticalMargin});
				self.scene.find('.game').css(cssSizes);
				self.canvas.width = self.width;
				self.canvas.height = self.height;
			});
			$(window).resize();

		},

		run: function () {
			var p = new Player();
			console.log(p);

			
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
		
	});

	return Game;
});