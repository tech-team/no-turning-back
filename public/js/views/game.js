define([
    'views/baseView',
    'utils/BrowserCheck',
    'tmpl/game',
    'game/Game',
    'views/gamefinished',
    'utils/CssUtils',
    'game/misc/KeyCoder',
    'utils/Message',
    'CConnector'
], 
function(BaseView, checker, tmpl, Game, GameFinishedView, CssUtils, KeyCoder, Message, CConnector) {
    var GameView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#game',
        hidden: true,

        canvas: null,
        scene: null,
        game: null,
        guid: null,

        $pauseButton: null,
        $pauseIconPause: null,
        $pauseIconPlay: null,
        gamePaused: false,
        pauseReason: null,

        $mobileIcon: null,
        $mobileConnect: null,
        $mobileToken: null,
        $reconnectButton: null,
        $loadingIndicator: null,
        mobileOpened: false,

        messenger: null,

        cConnector: null,

        initialize: function () {
            this.render();
        },

        browserSupport: function() {
            if (!checker.browserSupport()) {
                this.messenger.showMessage("Your browser is not supported. Sorry", true);
            }
        },

        showPauseButton: function() {
            this.$pauseButton.show();
        },

        hidePauseButton: function() {
            this.$pauseButton.hide();
        },

        triggerConnectDialog: function() {

            if (!this.gamePaused) {
                this.triggerGamePause();
            }

            if (!this.mobileOpened) {
                this.$mobileConnect.show();
                CssUtils.showBlackOnWhite(this.$mobileIcon);
                this.mobileOpened = true;
                this.hidePauseButton();
                this.messenger.hideMessage(true);
            }
            else {
                this.triggerGamePause();
                this.$mobileConnect.hide();
                CssUtils.showWhiteOnBlack(this.$mobileIcon);
                this.mobileOpened = false;
                this.showPauseButton();

            }

        },

        triggerGamePause: function(ignore_notify, ignore_send) {
            if (this.game.state === Game.GameState.Game) {
                CssUtils.showBlackOnWhite(this.$pauseButton);
                this.$pauseIconPause.hide();
                this.$pauseIconPlay.show();
                this._pauseGame(ignore_notify, ignore_send);
            } else {
                CssUtils.showWhiteOnBlack(this.$pauseButton);
                this.$pauseIconPause.show();
                this.$pauseIconPlay.hide();
                this._resumeGame(ignore_notify, ignore_send);
            }
        },

        _pauseGame: function(ignore_notify, ignore_send) {
            this.gamePaused = true;
            this.game.pause(ignore_notify, ignore_send);
        },

        _resumeGame: function(ignore_notify, ignore_send) {
            this.gamePaused = false;
            this.game.continueGame(ignore_notify, ignore_send);
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$('#game-field')[0];
            this.scene = this.$('#scene');
            this.guid = this.$('#token');

            this.$pauseButton = this.$('.pause-icon');
            this.$pauseIconPause = this.$pauseButton.find('.game-icon__pause');
            this.$pauseIconPlay = this.$pauseButton.find('.game-icon__play');

            this.$mobileIcon = this.$('.mobile-icon');
            this.$mobileConnect = this.$('.mobile-connect');
            this.$mobileToken = this.$('#connect_token');

            this.$reconnectButton = this.$('.reconnect-button');
            this.$loadingIndicator = this.$('.loading-indicator');

            this.createEvents();
            this.messenger = new Message(this.$el);
            this.calcDimensions();

            return this;
        },

        confirm: function(callbacks) {
            callbacks = this._getConfirmCallbacks(callbacks);

            if (!this.gamePaused)
                this._pauseGame(true, false);

            this.$pauseButton.hide();
            this.$mobileIcon.hide();

            var self = this;
            var controls = [
                {
                    name: "Yes",
                    action: function() {
                        if (self.gamePaused)
                            self._resumeGame(true, false);

                        self.$pauseButton.show();
                        self.$mobileIcon.show();

                        callbacks.yes();
                    }
                },
                {
                    name: "No",
                    action: function() {
                        if (self.gamePaused)
                            self._resumeGame(true, false);

                        self.$pauseButton.show();
                        self.$mobileIcon.show();

                        self.messenger.hideMessage();

                        callbacks.no();
                    }
                }
            ];
            this.messenger.showMessage("Do you really want to close this page?", true, null, controls);
        },

        createEvents: function() {
            var self = this;

            this.$mobileIcon.on('mousemove', function() {
                CssUtils.showBlackOnWhite(self.$mobileIcon);
            });
            this.$mobileIcon.on('mouseleave', function() {
                if (!self.mobileOpened)
                    CssUtils.showWhiteOnBlack(self.$mobileIcon);
            });

            this.$mobileIcon.on('click', function() {
                self.triggerConnectDialog();
            });

            this.$pauseButton.on('mousemove', function() {
                if (!self.gamePaused) {
                    CssUtils.showBlackOnWhite(self.$pauseButton);
                }
            });
            this.$pauseButton.on('mouseleave', function() {
                if (!self.gamePaused) {
                    CssUtils.showWhiteOnBlack(self.$pauseButton);
                }
            });

            this.$pauseButton.on('click', function() {
                self.triggerGamePause();
            });

            this.$reconnectButton.on('click', function() {
                // $(this).toggleClass("rotated-thing");
                // var $rb = $(this);
                // $rb.removeClass('rotated-thing');
                // setTimeout(function(){$rb.addClass('rotated-thing')},0);

                self.$loadingIndicator.show();
                self.$mobileToken.hide();
                window.server && window.server.forceReconnect();
            });

            (new KeyCoder()).addEventListener("keyup", KeyCoder.P, this.triggerGamePause.bind(this));
        },

        show: function () {
            this.$el.show();
            this.hidden = false;
            this.browserSupport();
            this.runGame();
        },

        hide: function () {
            if (!this.hidden) {
                this.messenger.hideMessage();
                this.$el.hide();
                this.game.stop();
                (new KeyCoder()).removeAllEvents();
                this.hidden = true;
            }
        },

        onJoystickMessage: function(data, answer) {
            switch (data.type) {
                case "orientation":
                    if (data.orientation === "portrait") {
                        this.pauseReason = 'orientation';
                        console.log("change orientation!");

                        this.$pauseButton.hide();
                        this.$mobileIcon.hide();
                        this.triggerGamePause(true, true);
                        this.messenger.showMessage("Change device orientation to landscape", true);
                    }
                    else {
                        if (this.pauseReason == 'orientation') {
                            this.pauseReason = null;
                            console.log("orientation is correct");

                            this.$pauseButton.show();
                            this.$mobileIcon.show();
                            this.triggerGamePause(true, true);
                            this.messenger.hideMessage();
                        }
                    }
                    break;
                default:
                    break;
            }

        },

        startJoystick: function() {
            var self = this;
            this.cConnector = new CConnector({
                onStart: function() {
                    if (self.mobileOpened) {
                        self.triggerConnectDialog(); // скрыть если открыто
                    }
                    self.game.onJoystickReady();
                },
                saveToken: function(token) {
                    self.$mobileToken.show();
                    self.$loadingIndicator.hide();
                    self.$mobileToken.text(token);
                },
                onMessage: function(data, answer) {
                    if (data.type === "orientation") {
                        self.onJoystickMessage(data, answer);
                    }
                    else {
                        self.game.onJoystickMessage(data, answer);
                    }
                },
                onForceReconnect: function(theirAttempt) {
                    if (theirAttempt) {
                        if (!self.gamePaused)
                            self._pauseGame(true, true);

                        var closeCallback = function() {
                            self.messenger.hideMessage();
                            if (self.gamePaused)
                                self._resumeGame(true, true);
                        };

                        var controls = [
                            {
                                name: "Okay",
                                action: closeCallback
                            }
                        ];
                        self.messenger.showMessage("Joystick has been disconnected", false, closeCallback, controls);
                    }

                },
                onDisconnect: function() {
                    self._pauseGame(false, true);
                    self.messenger.showMessage("You were disconnected", false, function() {
                        self.game.continueGame();
                    });
                }
            });
        },

        runGame: function() {
            var self = this;

            var ctx = this.canvas.getContext("2d");
            //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.game = new Game(this.canvas, false, 
                function() {
                    self.startJoystick();
                    self.game.run();
                    if (!self.mobileOpened) {
                        self.showPauseButton();
                    } else {
                        self.triggerGamePause(true, false);
//                        self.triggerConnectDialog();
//                        self.triggerConnectDialog();
                    }
                }
            );

            this.game.gameFinished.add(function(event) {
                self.game.stop(true);
                GameFinishedView.show(event.score, event.message);
                window.server.send({
                    type: "info",
                    action: "gamefinished",
                    message: event.message
                });
            });

            this.game.gameStateChanged.add(function(event) {
                if (event.state === Game.GameState.Pause) {
                    self.messenger.showMessage("Game paused", true);
                } else if (event.state === Game.GameState.Game) {
                    self.messenger.hideMessage();
                }
            });
        },

        calcDimensions: function() {
            if (this.scene === null) {
                console.error("#scene is null");
                return;
            }

            var self = this;
            $(window).resize(function() {
                var width = $(this).width();
                var height = $(this).height();
                var cssSizes = {
                    'width': width + "px",
                    'height' : height + "px"
                };
                self.scene.css(cssSizes);
                self.canvas.width = width;
                self.canvas.height = height;

                if (self.game)
                    self.game.resize();
            });
            $(window).resize();
        }

    });

    return new GameView();
});