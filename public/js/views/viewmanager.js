define([
    'backbone'
], 
function(Backbone, tmpl) {
    var ViewManager = Backbone.View.extend({

        template: tmpl,
        el: '#page',
        views: {},

        initialize: function () {
            var self = this;
            $(document).on("showPageEvent", function(event) {
                _.each(self.views, function(value, key) {
                    if (event.pageId !== key) {
                        value.hide();
                    }
                });
            });
        },

        addView: function(viewId, view) {
            this.views[viewId] = view;
            
        }

    });

    return new ViewManager();
});