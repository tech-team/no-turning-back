define([
	'classy',
	'easel',
	'game/LevelManager',
	'game/Level',
	'game/Player',
	'game/ResourceManager',
	'game/SpriteTiler'
],
function(Class, createjs, LevelManager, Level, Player, ResourceManager, SpriteTiler) {
	var Game = Class.$extend({
		__init__: function(canvas) {
			this.FPS = 60;
			this.canvas = canvas;
            this.state = Game.GameState.Loading;
			this.width = canvas.width;
			this.height = canvas.height;
			this.stage = new createjs.Stage(this.canvas);
			this.ticker = createjs.Ticker;
			this.levelManager = new LevelManager();
			this.startLevelId = 0;
			this.level = null;
			this.player = new Player();
			this.resourceManager = new ResourceManager(this.onResourcesLoaded, this);
		},

        __classvars__: {
          GameState: {
              Loading: 0,
              Game: 1,
              GameOver: 2
          }
        },

        onResourcesLoaded: function() {
        	console.log("Resources loaded");
            this.state = Game.GameState.Game;

            var levelData = this.levelManager.loadLevel(this.startLevelId);
            this.level = new Level(this.stage, levelData, this.player, this.resourceManager);
        },

		run: function() {
			var self = this;
			this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			this.ticker.setFPS(this.FPS);
			this.ticker.on("tick", function(event) {
				self.update(event);
			});

			var img = new Image();
			img.onload = function() {
				console.log(SpriteTiler(img, 10, 10));
			}
			img.src = "res/gfx/wall.png";
			
		},

		update: function(event) {
            if (this.state == Game.GameState.Game) {
                this.level.update(event);
                this.player.update(event);

                this.stage.update(event);
            }
		},

		test: function() {
			this.circle = new createjs.Shape();
			this.circle.graphics.beginFill("blue").drawCircle(100, 100, 50);

            this.output = this.stage.addChild(new createjs.Text("","bold 16px Verdana", "#000"))
            this.output.lineHeight = 15;
            this.output.textBaseline = "top";
            this.output.x = 100;
            this.output.y = 15;
			this.stage.addChild(this.circle);
		}
	});

	return Game;
});