define([
    'backbone',
    'tmpl/main'
], 
function(Backbone, tmpl) {
    var MainView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#mainPage',

        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));
            return this;
        },
        show: function () {
            this.$el.show();
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
        },

        hide: function () {
            this.$el.hide();
        },

    });

    return new MainView();
});