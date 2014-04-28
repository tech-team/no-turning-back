define([
    'backbone',
    'tmpl/game',
    'game/Game',
    'views/gamefinished'
], 
function(Backbone, tmpl, Game, GameFinishedView) {
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
            console.log("showing message");
            if (disallowHide)
                this.offMessageEvents();
            else
                this.onMessageEvents(callback);
            this.$messageText.text(messageText);
            this.$messageDimmer.show();
            this.$message.show();
        },

        hideMessage: function() {
            this.$message.hide();
            this.$messageDimmer.hide();
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

            this.calcDimensions();

            return this;
        },

        show: function () {
            this.$el.show();
            this.hidden = false;
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
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
                        this.game.pause();
                    }
                    else {
                        console.log("thanks for changing orientation");
                        this.hideMessage();
                        this.game.continueGame();
                    }
                    break;
                default:
                    break;
            }

        },

        startJoystick: function() { // TODO: add reconnect feature
            var self = this;
            Game.console({
                onStarted: function() {
                    self.game.startJoystickSession(window.server);
                },
                saveToken: function(guid) {
                    self.guid.attr('value', guid);
                },
                onMessage: function(data, answer) {
                    if (data.type === "orientation") {
                        self.onJoystickMessage(data, answer);
                    }
                    else {
                        self.game.onJoystickMessage(data, answer);
                    }
                },
                onDisconnect: function() {
                    console.log("joystick disconnected");
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
                    self.startJoystick();
                    self.game.run();
                }
            );
            
            var self = this;
            $(document).on("levelFinished", function(event) {
                self.game.stop();
                GameFinishedView.show(event.score, event.message);
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