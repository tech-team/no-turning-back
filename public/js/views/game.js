define([
    'backbone',
    'tmpl/game',
    'game/Game'
], 
function(Backbone, tmpl, Game) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        el: '#page',
        scene: '#scene',
        canvas: 'game-field',
        game: null,

        initialize: function () {
        },
        render: function () {
            this.game = new Game($(this.scene), document.getElementById(this.canvas));
            this.game.run();
            return this;
        },
        show: function () {
            this.$el.html(this.template());
            
        },
        hide: function () {
            
        }

    });

    return new GameView();
});