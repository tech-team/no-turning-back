define([
        'backbone'
    ],
    function(Backbone, tmpl) {
        var BaseView = Backbone.View.extend({
            ConfirmRequired: false
        });

        return BaseView;
    });