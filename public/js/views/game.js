define([
    'backbone',
    'tmpl/game'
], 
function(Backbone, tmpl) {
    var GameView = Backbone.View.extend({

        template: tmpl,
        el: '#page',

        initialize: function () {
            // TODO
        },
        render: function () {
            this.$el.html(this.template());
        },
        show: function () {
            
        },
        hide: function () {
            // TODO
        }

    });

    return new GameView();
});