define([
    'backbone',
    'tmpl/game',
    'game/Game'
], 
function(Backbone, tmpl, Game) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        el: '#page',
        canvas: null,
        scene: null,
        game: null,

        initialize: function () {

        },

        render: function () {
            this.$el.html(this.template());
            this.canvas = document.getElementById('game-field');
            this.scene = $('#scene');
            this.calcDimensions();

            this.runGame();
            return this;
        },
        show: function () {
            this.render();
        },
        
        hide: function () {
            
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
            this.game = new Game(this.canvas);
            this.game.run();
        }

    });

    return new GameView();
});