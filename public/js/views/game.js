define([
    'backbone',
    'tmpl/game',
    'game/Game',
    'views/viewmanager',
    'views/gamefinishedview'
], 
function(Backbone, tmpl, Game, ViewManager, GameFinishedView) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        el: '#pages',
        pageId: '#gamePage',
        canvas: null,
        scene: null,
        game: null,

        initialize: function () {
            ViewManager.addView(this.pageId, this);
            this.render();

            
        },

        render: function () {
            var p = $(this.template());
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);

            this.canvas = document.getElementById('game-field');
            this.scene = $('#scene');
            this.calcDimensions();

            
            return this;
        },
        show: function () {
            this.$el.find(this.pageId).show();
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            this.runGame();
        },
        hide: function () {
            this.$el.find(this.pageId).hide();
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
        }

    });

    return new GameView();
});