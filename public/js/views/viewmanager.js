define([
    'backbone'
], 
function(Backbone) {
    var ViewManager = Backbone.View.extend({
        el: '#pages',
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

        addView: function(view) {
            this.views[view.pageId] = view;
            this.$el.append(view.$el);
            console.log(view.$el);
            console.log(this.$el);
        }

    });

    return new ViewManager();
});