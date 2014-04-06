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
		__init__: function(canvas, editorMode, onLoadedCallback) {
            this.editorMode = editorMode;
			this.FPS = 30;
			this.canvas = canvas;
            this.state = Game.GameState.Loading;
			this.width = canvas.width;
			this.height = canvas.height;
			this.stage = new createjs.Stage(this.canvas);
			this.ticker = createjs.Ticker;
			this.levelManager = new LevelManager();
			this.level = null;
			this.player = new Player();
			this.resourceManager = new ResourceManager(this.onResourcesLoaded, this);
			this.keyCoder = new KeyCoder(editorMode);
			this.onLoadedCallback = onLoadedCallback;
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

            var self = this;
            this.levelManager.loadNextLevel(function(event) {
        		self.level = new Level(self.stage, event.levelData, self.player, self.resourceManager, self.editorMode);
        		self.onLoadedCallback();
        	});
        },

		run: function() {
			var self = this;
			this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			this.ticker.setFPS(this.FPS);
			this.ticker.on("tick", function(event) {
				_.extend(event, self.keyCoder.getKeys());
				self.update(event);
			});
		},

		stop: function() {
			this.state = Game.GameState.GameOver;
		},

		update: function(event) {
            if (this.state == Game.GameState.Game) {
                this.level.update(event);

                this.stage.update(event);
            }
		},

        resize: function() {
            this.level.resize();
        }
	});

	return Game;
});