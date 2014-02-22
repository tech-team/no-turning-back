define([
	'game/models/player'
],
function(Player) {
	var Game = {
		FPS: 60,
		scene: null,
		canvas: null,
		context: null,
		width: 0,
		height: 0,

		calcDimensions: function() {
			if (this.scene === null)
				return;

			var self = this;
			$(window).resize(function() {
				var horizontalMargin = 50;
				var verticalMargin = 10;
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

		run: function (_scene, _canvas) {
			this.scene = _scene;
			this.canvas = _canvas;
			this.context = _canvas.getContext("2d");

			this.calcDimensions();
			
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