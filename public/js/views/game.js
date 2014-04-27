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

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$el.find('#game-field')[0];
            this.scene = this.$el.find('#scene');
            this.guid = this.$el.find('#token');
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
            console.log(data);
        },

        startJoystick: function() {
            var self = this;
            Game.console({
                onStarted: function() {
                    self.game.startJoystickSession(window.server);
                },
                saveToken: function(guid) {
                    self.guid.attr('value', guid);
                },
                onMessage: function(data, answer) {
                    console.log("receive!");
                    self.onJoystickMessage(data, answer);
                    self.game.onJoystickMessage(data, answer);
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