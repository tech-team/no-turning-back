define([
    'backbone',
    'modernizr',
    'tmpl/game',
    'game/Game',
    'views/gamefinished',
    'utils/CssUtils'
], 
function(Backbone, modernizr, tmpl, Game, GameFinishedView, CssUtils) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#gamePage',
        hidden: true,

        canvas: null,
        scene: null,
        game: null,
        guid: null,
        $message: null,
        $messageText: null,
        $messageDimmer: null,

        $pauseButton: null,
        $pauseIconPause: null,
        $pauseIconPlay: null,
        gamePaused: false,

        $mobileIcon: null,
        $mobileConnect: null,
        $mobileToken: null,
        $closeButton: null,
        $loadingIndicator: null,
        mobileOpened: false,


        initialize: function () {
            this.render();
        },


        onMessageEvents: function(callback) {
            var self = this;
            this.$messageDimmer.on('click', function () {
                self.hideMessage();
                if (callback)
                    callback();
            });

            this.$message.on('click', function () {
                self.hideMessage();
                if (callback)
                    callback();
            });
        },

        offMessageEvents: function() {
            this.$messageDimmer.off('click');
            this.$message.off('click');
        },


        showMessage: function(messageText, disallowHide, callback) {
            if (disallowHide)
                this.offMessageEvents();
            else
                this.onMessageEvents(callback);
            this.$messageText.text(messageText);
            this.$messageDimmer.show();
            this.$message.show();
        },

        hideMessage: function(keepDimmer) {
            this.$message.hide();
            if (!keepDimmer)
                this.$messageDimmer.hide();
        },

        checkBrowserSupport: function() {
            if (Modernizr) {
                if (!Modernizr.canvas || !Modernizr.canvastext || !Modernizr.localstorage
                    || !Modernizr.audio || !Modernizr.multiplebgs
                    || !Modernizr.csstransforms || !Modernizr.fontface) {
                    this.showMessage("Your browser is not supported. Sorry", true);
                }
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
                this.hideMessage(true);
            }
            else {
                this.triggerGamePause();
                this.$mobileConnect.hide();
                CssUtils.showWhiteOnBlack(this.$mobileIcon);
                this.mobileOpened = false;
                this.showPauseButton();

            }

        },

        triggerGamePause: function() {
            if (this.game.state === Game.GameState.Game) {
                CssUtils.showBlackOnWhite(this.$pauseButton);
                this.$pauseIconPause.hide();
                this.$pauseIconPlay.show();
                this._pauseGame();
            } else {
                CssUtils.showWhiteOnBlack(this.$pauseButton);
                this.$pauseIconPause.show();
                this.$pauseIconPlay.hide();
                this._resumeGame();
            }
        },

        _pauseGame: function() {
            this.gamePaused = true;
            this.game.pause();
        },

        _resumeGame: function() {
            this.gamePaused = false;
            this.game.continueGame();
        },

        disconnect: function(sendToJoystick) {
            localStorage.removeItem('consoleguid');
            if (sendToJoystick) {
                window.server.send({
                    type: "disconnect"
                });
            }
            window.server.disconnect();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$el.find('#game-field')[0];
            this.scene = this.$el.find('#scene');
            this.guid = this.$el.find('#token');

            this.$message = this.$el.find('.message');
            this.$messageText = this.$message.find('.message__textbox__text');
            this.$messageDimmer = this.$el.find('.message-dimmer');

            this.$pauseButton = this.$el.find('.pause-icon');
            this.$pauseIconPause = this.$pauseButton.find('.game-icon__pause');
            this.$pauseIconPlay = this.$pauseButton.find('.game-icon__play');

            this.$mobileIcon = this.$el.find('.mobile-icon');
            this.$mobileConnect = this.$el.find('.mobile-connect');
            this.$mobileToken = this.$el.find('.mobile-connect__token');

            this.$closeButton = this.$el.find('.reconnect-button');
            this.$loadingIndicator = this.$el.find('.loading-indicator');
            this.createEvents();

            this.calcDimensions();

            return this;
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

            $(document).on("gameStateChanged", function(event) {
                if (event.state === Game.GameState.Pause) {
                    self.$messageDimmer.show();
                    self.showMessage("Game paused", true);
                    if (window.server) {
                        window.server.send({
                            type: "info",
                            action: "gameStateChanged",
                            arg: "pause"
                        });
                    }
                } else if (event.state === Game.GameState.Game) {
                    self.hideMessage();
                    self.$messageDimmer.hide();
                    if (window.server) {
                        window.server.send({
                            type: "info",
                            action: "gameStateChanged",
                            arg: "play"
                        });
                    }
                }
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


            this.$closeButton.on('click', function() {
                self.disconnect(true);
                self.$closeButton.hide();
            });
        },

        show: function () {
            this.$el.show();
            this.hidden = false;
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            this.checkBrowserSupport();
            this.runGame();
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.game.stop();
                this.hidden = true;
            }
        },

        onJoystickMessage: function(data, answer) {
            switch (data.type) {
                case "orientation":
                    if (data.orientation === "portrait") {
                        console.log("change orientation!");
                        this.showMessage("Change device orientation to landsape", true);
                        this.game.pause(true);
                    }
                    else {
                        console.log("thanks for changing orientation");
                        this.hideMessage();
                        this.game.continueGame(true);
                    }
                    break;

                case "disconnect":
                    this.disconnect();
                    break;
                default:
                    break;
            }

        },

        startJoystick: function() { // TODO: add reconnect feature
            window.server = null;
            var self = this;
            Game.console({
                onStarted: function() {
                    self.game.startJoystickSession(window.server);
                    if (self.mobileOpened) {
                        self.triggerConnectDialog();
                    }
                },
                saveToken: function(guid) {
                    self.$loadingIndicator.hide();
                    self.$mobileToken.text(guid);
                    if (guid === "Already connected") {
                        self.$closeButton.show();
                    }

                },
                onMessage: function(data, answer) {
                    if (data.type === "orientation" || data.type === "disconnect") {
                        self.onJoystickMessage(data, answer);
                    }
                    else {
                        self.game.onJoystickMessage(data, answer);
                    }
                },
                onDisconnect: function() {
                    console.log("joystick disconnected");
                    self.showMessage("You were disconnected", false, function() {
                        self.game.continueGame();
                    });
                    self.game.pause(true);
                }
            });
        },

        runGame: function() {
            var ctx = this.canvas.getContext("2d");
            //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.game = new Game(this.canvas, false, 
                function() {
                    if (!self.mobileOpened) {
                        self.showPauseButton();
                    }
                    self.startJoystick();
                    self.game.run();
                }
            );
            
            var self = this;
            $(document).on("gameFinished", function(event) {
                self.game.stop(true);
                GameFinishedView.show(event.score, event.message);
                window.server.send({
                    type: "info",
                    action: "gamefinished",
                    message: event.message
                });
            });
        },

        calcDimensions: function() {
            if (this.scene === null) {
                console.error("#scene is null");
                return;
            }

            var horizontalMargin = 10;
            var verticalMargin = 10;
            var self = this;
            $(window).resize(function() {
                var width = $(this).width();// - 2 * horizontalMargin;
                var height = $(this).height();// - 2 * verticalMargin;
                var cssSizes = {
                    'width': width + "px",
                    'height' : height + "px"
                };
                self.scene.css(cssSizes);//.css({'margin-top': verticalMargin});
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