define([
    'jquery',
	'underscore',
	'classy',
	'easel',
    'collision',
	'game/misc/KeyCoder',
	'game/LevelManager',
	'game/GameMechanics',
    'game/Editor',
	'game/entities/Player',
	'game/ResourceManager',
    'console',
    'game/misc/Messenger'
],
function($, _, Class, createjs, ndgmr, KeyCoder, LevelManager, GameMechanics, Editor, Player, ResourceManager, Console, Messenger) {
	var Game = Class.$extend({
		__init__: function(canvas, editorMode, onLoadedCallback) {
            this.editorMode = editorMode;
			this.FPS = 30;

			this.canvas = canvas;
            this.state = Game.GameState.Loading;
			this.width = canvas.width;
			this.height = canvas.height;
			this.stage = new createjs.Stage(this.canvas);
            Messenger.setStage(this.stage);
			this.ticker = createjs.Ticker;
			this.levelManager = new LevelManager(this.onLevelLoaded, this);
			this.level = null;
			this.player = new Player();
            this.resourceManager = null;
			this.keyCoder = new KeyCoder(editorMode);
			this.onLoadedCallback = onLoadedCallback;
		},

        __classvars__: {
          	GameState: {
              	Loading: 0,
              	Game: 1,
              	GameOver: 2,
                Pause: 3
          	},
            console: Console
        },

        onLevelLoaded: function() {
            this.resourceManager = ResourceManager.load(this.onResourcesLoaded, this);
        },

        onResourcesLoaded: function() {
            this.state = Game.GameState.Game;
            createjs.Sound.stop();

            var self = this;
            this.levelManager.loadNextLevel(function(event) {
                if (!self.editorMode) {
                    self.level = new GameMechanics(self.stage, event.levelData, self.player, self.resourceManager);
                    $(document).on("levelFinished", self.onLevelFinished.bind(self));
                }
                else {
                    self.level = new Editor(self.stage, self.resourceManager);
                }

                self.onLoadedCallback();
        	});
        },

        onLevelFinished: function() {
            var self = this;
            this.levelManager.loadNextLevel(function(event) {
                if (event.levelData == null) {
                    ResourceManager.playSound(ResourceManager.soundList.Victory);
                    $.event.trigger({
                        type: "gameFinished",
                        score: self.player.score,
                        message: "You win!"
                    });
                }
                else {
                    self.level = new GameMechanics(self.stage, event.levelData, self.player, self.resourceManager);
                }
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

        changeState: function(state, ignore_notify) {
            this.state = state;
            if (!ignore_notify) {
                $.event.trigger({
                    type: "gameStateChanged",
                    state: this.state
                });
            }
        },

		stop: function(ignore_notify) {
			this.changeState(Game.GameState.GameOver, ignore_notify);
            return this.state;
		},

        pause: function(ignore_notify) {
            if (this.state != Game.GameState.Pause)
                this.changeState(Game.GameState.Pause, ignore_notify);
            else
                this.changeState(Game.GameState.Game, ignore_notify);

            return this.state;
        },

        continueGame: function(ignore_notify) {
            this.changeState(Game.GameState.Game, ignore_notify);
            return this.state;
        },

		update: function(event) {
            if (this.state == Game.GameState.Game) {
                this.level.update(event);
                this.stage.update(event);
            }
		},

        startJoystickSession: function(server) {
            this.level.isJoystick = true;
            this.level.joystickServer = server;
        },

        onJoystickMessage: function(data, answer) {
            this.level.onJoystickMessage(data, answer);
        },

        resize: function() {
            //TODO: both Editor and GM should be derieved from one basic class with resize/update/keyFunc methods
            if (this.level)
                this.level.resize();
        }
	});

	return Game;
});