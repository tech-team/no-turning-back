define([
        'backbone'
    ],
    function(Backbone, tmpl) {
        var BaseView = Backbone.View.extend({
            _getConfirmCallbacks: function(callbacks) {
                callbacks.yes = callbacks.yes ? callbacks.yes : function(data) {};
                callbacks.no = callbacks.no ? callbacks.no : function(data) {};

                return callbacks;
            },

            confirm: function(callbacks) {
                callbacks = this._getConfirmCallbacks(callbacks);
                callbacks.yes();
            }
        });

        return BaseView;
    });