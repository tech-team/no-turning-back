define([
    'views/baseView',
    'tmpl/main'
], 
function(BaseView, tmpl) {
    var MainView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#mainPage',
        hidden: true,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));
            return this;
        },
        
        show: function () {
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            this.$el.show();
            this.hidden = false;
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        }

    });

    return new MainView();
});