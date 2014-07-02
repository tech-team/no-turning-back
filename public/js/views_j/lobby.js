define([
   'views/baseView',
   'tmpl_j/lobby'
], function(BaseView, tmpl) {
    var LobbyView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#lobby',
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

    return new LobbyView();
});