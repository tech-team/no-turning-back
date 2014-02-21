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
        },
        show: function () {
            
        },
        hide: function () {
            // TODO
        }

    });

    return new MainView();
});