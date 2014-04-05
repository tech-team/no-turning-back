define([
    'backbone',
    'tmpl/game',
    'game/Game',
    'views/gamefinishedview'
], 
function(Backbone, tmpl, Game, GameFinishedView) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#gamePage',
        canvas: null,
        scene: null,
        game: null,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$el.find('#game-field')[0];
            this.scene = this.$el.find('#scene');
            this.calcDimensions();

            return this;
        },

        show: function () {
            this.$el.show();
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            this.runGame();
        },

        hide: function () {
            this.$el.hide();
        },

        runGame: function() {
            var self = this;
            this.game = new Game(this.canvas, false, 
                function() {
                    self.game.run();
                }
            );
            
            $(document).on("levelFinished", function(event) {
                self.game.state = Game.GameState.GameOver;
                GameFinishedView.show(event.score);
            });
        },

        calcDimensions: function() {
            if (this.scene === null) {
                console.log("#scene is null");
                return;
            }

            var horizontalMargin = 50;
            var verticalMargin = 10;
            var self = this;
            $(window).resize(function() {
                var width = $(this).width() - 2 * horizontalMargin;
                var height = $(this).height() - 2 * verticalMargin;
                var cssSizes = {
                    'width': width + "px",
                    'height' : height + "px"
                };
                self.scene.css(cssSizes).css({'margin-top': verticalMargin});
                self.canvas.width = width;
                self.canvas.height = height;
            });
            $(window).resize();

        },

    });

    return new GameView();
});