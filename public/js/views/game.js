define([
    'backbone',
    'tmpl/game'
], 
function(Backbone, tmpl) {
    var View = Backbone.View.extend({

        template: tmpl,
        el: '#page',

        initialize: function () {
            // TODO
        },
        render: function () {
            // TODO
        },
        show: function () {
            this.$el.html(this.template());
        },
        hide: function () {
            // TODO
        }

    });

    return new View();
});