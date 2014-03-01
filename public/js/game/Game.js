define([
	'classy',
	'easel',
	'game/LevelManager',
	'game/Level',
	'game/Player',
	'game/ResourceManager'
],
function(Class, createjs, LevelManager, Level, Player, ResourceManager) {
	var Game = Class.$extend({
		__init__: function(canvas) {
			this.FPS = 60;
			this.canvas = canvas;
            this.state = Game.GameState.Loading;
			this.WIDTH = canvas.width;
			this.HEIGHT = canvas.height;
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
            this.state = Game.GameState.Game;
            console.log("onResourcesLoaded");

            this.level = new Level(this.stage, this.levelManager.loadLevel(this.startLevelId),
                this.resourceManager);
        },

		run: function() {
			var self = this;
			this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			this.ticker.setFPS(this.FPS);
			this.ticker.on("tick", function(event) {
				self.update(event);
			});
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