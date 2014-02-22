define([
    'backbone',
    'tmpl/game',
    'game/game_main'
], 
function(Backbone, tmpl, Game) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        el: '#page',
        scene: '#scene',
        canvas: 'game-field',

        initialize: function () {
            // TODO
        },
        render: function () {
            this.$el.html(this.template());
            Game.run($(this.scene), document.getElementById(this.canvas));
        },
        show: function () {
            
        },
        hide: function () {
            // TODO
        }

    });

    return new GameView();
});