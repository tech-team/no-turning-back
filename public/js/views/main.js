define([
    'backbone',
    'tmpl/main',
    'views/viewmanager'
], 
function(Backbone, tmpl, ViewManager) {
    var MainView = Backbone.View.extend({

        template: tmpl,
        el: '#pages',
        pageId: '#mainPage',

        initialize: function () {
            ViewManager.addView(this.pageId, this);
            this.render();
        },
        render: function () {
            var p = $(this.template({score: 452}));
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);
            return this;
        },
        show: function () {
            this.$el.find(this.pageId).show();
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
        },

        hide: function () {
            this.$el.find(this.pageId).hide();
        },

    });

    return new MainView();
});