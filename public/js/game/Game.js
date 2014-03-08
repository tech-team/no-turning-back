define([
	'underscore',
	'classy',
	'easel',
    'collision',
	'game/KeyCoder',
	'game/LevelManager',
	'game/Level',
	'game/Player',
	'game/ResourceManager'
],
function(_, Class, createjs, ndgmr, KeyCoder, LevelManager, Level, Player, ResourceManager) {
	var Game = Class.$extend({
		__init__: function(canvas, editorMode) {
            this.editorMode = editorMode;
			this.FPS = 30;
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
			this.keyCoder = new KeyCoder();
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

            this.level = new Level(this.stage, levelData, this.player, this.resourceManager, this.editorMode);
        },

		run: function() {
			var self = this;
			this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			this.ticker.setFPS(this.FPS);
			this.ticker.on("tick", function(event) {
				_.extend(event, self.keyCoder.getKeys());
				self.update(event);
			});

            if (this.editorMode) {
                $
            }
		},

		update: function(event) {
            if (this.state == Game.GameState.Game) {
                this.level.update(event);

                this.stage.update(event);
            }
		}
	});

	return Game;
});