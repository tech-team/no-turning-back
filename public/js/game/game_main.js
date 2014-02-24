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

            this.horizontalMargin = 50;
            this.verticalMargin = 20;

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
				self.width = $(this).width() - 2 * self.horizontalMargin;
				self.height = $(this).height() - 2 * self.verticalMargin;
				var cssSizes = {
					'width': self.width + "px",
					'height' : self.height + "px"
				};
				self.scene.css(cssSizes).css({'margin-top': self.verticalMargin});
				self.scene.find('.game').css(cssSizes);
				self.canvas.width = self.width;
				self.canvas.height = self.height;
			});
			$(window).resize();

		},

		run: function () {
            this.levelId = 0;
            this.level = this.levelManager.getLevel(this.levelId);
            this.resourceManager.loadLevel(this.level);

            this.player.fromJSON(this.level.player);
			
			var game = this;
			setInterval(function() {
				game.update();
                game.render();
			}, 1000 / this.FPS);

            $(document).bind("keydown", function(event) {
                game.keydown[String.fromCharCode(event.which).toLowerCase()] = true;
            });

            $(document).bind("keyup", function(event) {
                game.keydown[String.fromCharCode(event.which).toLowerCase()] = false;
            });

            $(this.canvas).bind("mousemove", function(event) {
                var cursor = game.getCursorPos(event);

                game.player.angle = Math.atan2(cursor.y - game.player.y,
                    cursor.x - game.player.x);
            });
		},

        getCursorPos: function(event) {
            return {
                x: Math.ceil(event.pageX - $(event.target).offset().left),
                y: Math.ceil(event.pageY - $(event.target).offset().top)
            }
        },

        isInWall: function(x, y) {
            return this.level.cells[Math.floor(y/this.tileSize)][Math.floor(x/this.tileSize)]
                == ResourceManager.TileType.Wall;
        },

		update: function() {
            var x = this.player.x;
            var y = this.player.y;

            if (this.keydown["a"])
                this.player.angle-=0.1;

            if (this.keydown["d"])
                this.player.angle+=0.1;

            if (this.keydown["w"]) {
                y += Math.sin(this.player.angle);
				x += Math.cos(this.player.angle);
			}

            if (this.keydown["s"]) {
                y -= Math.sin(this.player.angle);
				x -= Math.cos(this.player.angle);
            }

            if (!this.isInWall(x, y)) {
                this.player.x = x;
                this.player.y = y;
            }
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