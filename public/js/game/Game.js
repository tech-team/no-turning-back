define([
    'jquery',
	'lodash',
	'classy',
    'signals',
	'easel',
    'alertify',
	'game/misc/KeyCoder',
	'game/LevelManager',
	'game/GameLevel',
    'game/Editor',
	'game/entities/Player',
	'game/ResourceManager',
    'game/misc/Messenger'
],
function($, _, Class, signals, createjs, alertify, KeyCoder, LevelManager, GameLevel, Editor, Player, ResourceManager, Messenger) {
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
            KeyCoder.setStage(this.stage);

			this.ticker = createjs.Ticker;
			this.levelManager = new LevelManager(this.onLevelLoaded.bind(this));
			this.level = null;
			this.player = null;
            this.resourceManager = null;
			this.keyCoder = new KeyCoder(editorMode);
			this.onLoadedCallback = onLoadedCallback;

            // Events
            this.gameFinished = new signals.Signal();
            this.gameStateChanged = new signals.Signal();
		},

        __classvars__: {
          	GameState: {
              	Loading: 0,
              	Game: 1,
              	GameOver: 2,
                Pause: 3
          	}
        },

        createGameLevel: function(levelData) {
            this.level = new GameLevel(this.stage, levelData, this.player, this.resourceManager);
            this.level.levelFinished.add(this.onLevelFinished.bind(this));
        },

        createEditor: function() {
            this.level = new Editor(this.stage, this.resourceManager, this.levelManager);
        },

        onLevelLoaded: function() {
            this.resourceManager = ResourceManager.load(this.onResourcesLoaded.bind(this));
        },

        onResourcesLoaded: function() {
            this.state = Game.GameState.Game;
            createjs.Sound.stop();

            var self = this;
            this.levelManager.loadNextLevel(function(data) {
                if (!self.editorMode) {
                    self.player = new Player();
                    self.createGameLevel(data);
                }
                else {
                    self.createEditor();
                }

                self.onLoadedCallback();
        	});
        },

        onLevelFinished: function(event) {
            var self = this;

            console.log('Level finished');
            this.keyCoder.removeAllListeners();

            if (event && event.status === 'gameFinished') {
                this.gameFinished.dispatch(event);
                return;
            }

            if (this.levelManager.isLastLevel()) {
                //game over, win!
                ResourceManager.playSound(ResourceManager.soundList.Victory);
                self.gameFinished.dispatch({
                    score: self.player.score,
                    message: "You win!"
                });
            }
            else {
                this.levelManager.loadNextLevel(function(data) {
                    if (data == null) {
                        alertify.alert("Unable to load level!");
                        return;
                    }

                    self.createGameLevel(data);
                });
            }
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

        changeState: function(state, ignore_notify, ignore_send) {
            this.state = state;
            if (!ignore_notify) {
                this.gameStateChanged.dispatch({
                    state: this.state
                });
            }
            if (!ignore_send) {
                var arg = null;
                switch (state) {
                    case Game.GameState.Game:
                        arg = "play";
                        break;
                    case Game.GameState.Pause:
                        arg = "pause";
                        break;
                }
                window.server && window.server.send({
                    type: "info",
                    action: "gameStateChanged",
                    arg: arg
                });
            }
        },

		stop: function(ignore_notify, ignore_send) {
			this.changeState(Game.GameState.GameOver, ignore_notify, ignore_send);
            this.level._finish();
            return this.state;
		},

        pause: function(ignore_notify, ignore_send) {
            if (this.state != Game.GameState.Pause)
                this.changeState(Game.GameState.Pause, ignore_notify, ignore_send);
            else
                this.changeState(Game.GameState.Game, ignore_notify, ignore_send);

            return this.state;
        },

        continueGame: function(ignore_notify, ignore_send) {
            this.changeState(Game.GameState.Game, ignore_notify, ignore_send);
            return this.state;
        },

		update: function(event) {
            if (this.state == Game.GameState.Game) {
                this.level.update(event);
                this.stage.update(event);
            }
		},

        onJoystickMessage: function(data, answer) {
            this.level.onJoystickMessage(data, answer);
        },

        onJoystickReady: function() {
            this.level.onJoystickReady();
        },

        resize: function() {
            if (this.level)
                this.level.resize();
        }
	});

	return Game;
});