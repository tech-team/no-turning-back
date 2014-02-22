define([
	'game/models/player', 'game/pulse'
],
function(Player) {
	function Game(_scene, _canvas) {

        pulse.ready(function() {
            // Create an engine.
            var engine = new pulse.Engine({
                gameWindow: 'pulse-container'
            });

            // Create a scene.
            var scene = new pulse.Scene();

            // Create a layer and add it to the scene.
            var layer = new pulse.Layer();
            layer.position = { x: 300, y : 200 };
            scene.addLayer(layer);

            // Create a label and add it to the layer.
            var label = new pulse.CanvasLabel({ text: 'Hello World!' });
            label.position = { x: 300, y: 200 };
            layer.addNode(label);

            // Add an activate the scene.
            engine.scenes.addScene(scene);
            engine.scenes.activateScene(scene);

            // Start the update and render loop.
            engine.go(30);
        });

		this.calcDimensions();
	};

	Game.prototype.calcDimensions = function() {
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

	};

	Game.prototype.run = function () {
		var self = this;
		setInterval(function() {
			self.update();
			self.render();
		}, 1000 / this.FPS);
	};

	Game.prototype.update = function() {

	};

	Game.prototype.render = function() {
		/*this.context.fillRect(50, 50, 160, 160);
        
        for (i = 0; i < 8; i += 2)
            for (j = 0; j < 8; j += 2) {
                this.context.clearRect(50 + i * 20, 50 + j * 20, 20, 20);
                this.context.clearRect(50 + (i + 1) * 20, 50 + (j + 1) * 20, 20, 20);
            }
            */
	};

	return Game;
});