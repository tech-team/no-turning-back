define([
    'backbone',
    'tmpl/main'
], 
function(Backbone, tmpl) {
    var View = Backbone.View.extend({

        template: tmpl,
        initialize: function () {
            // TODO
        },
        render: function () {
            // TODO
        },
        show: function () {
            $('#page').html(this.template);
        },
        hide: function () {
            // TODO
        }

    });

    return new View();
});