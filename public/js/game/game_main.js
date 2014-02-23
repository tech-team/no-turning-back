define([
	'classy',
    'game/ResourceManager',
    'game/LevelManager',
	'game/Player'
],
function(Class, ResourceManager, LevelManager, Player) {
	var Game = Class.$extend({
		__init__: function(_scene, _canvas) {
			this.FPS = 60;
			this.scene = _scene;
			this.canvas = _canvas;
			this.context = _canvas.getContext("2d");
			this.width = 0;
			this.height = 0;

            this.tileSize = 32;

            this.keydown = [];

            this.levelId = 0;
            this.level = null;

            this.levelManager = new LevelManager();
            this.resourceManager = new ResourceManager();

            this.player = new Player();

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


            this.levelId = 0;
            this.level = this.levelManager.getLevel(this.levelId);
            this.resourceManager.loadLevel(this.level);

            this.player.load(this.level.player);
			
			var self = this;
			setInterval(function() {
				self.update();
				self.render();
			}, 1000 / this.FPS);

            $(document).bind("keydown", function(event) {
                self.keydown[String.fromCharCode(event.which).toLowerCase()] = true;
            });

            $(document).bind("keyup", function(event) {
                self.keydown[String.fromCharCode(event.which).toLowerCase()] = false;
            });
		},

		update: function() {
            if (this.keydown["a"])
                this.player.x--;

            if (this.keydown["d"])
                this.player.x++;

            if (this.keydown["w"])
                this.player.y--;

            if (this.keydown["s"])
                this.player.y++;
		},

        render: function() {
            for (var i = 0; i < this.level.width; ++i)
                for (var j = 0; j < this.level.height; ++j)
                    this.context.drawImage(
                        this.resourceManager.getSprite(this.level.cells[j][i]),
                        i*this.tileSize,
                        j*this.tileSize);


            this.player.render(this.context);
        }
    });

	return Game;
});