define([
    'backbone',
    'tmpl/main'
], 
function(Backbone, tmpl) {
    var MainView = Backbone.View.extend({

        template: tmpl,
        el: '#page',

        initialize: function () {
            // TODO
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        },
        show: function () {
            this.render();
        },
        hide: function () {
            // TODO
        }

    });

    return new MainView();
});