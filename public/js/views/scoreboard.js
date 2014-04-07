define([
    'backbone',
    'tmpl/scoreboard',
    'collections/scores'
], 
function(Backbone, tmpl, scoresCollection) {
    var ScoreboardView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#scoreboardPage',
        hidden: true,

        loader: null,

        initialize: function () {
            this.render();
        },

        render: function (data, error_message) {
            data = data ? data : [];

            this.$el.html(this.template({
                                            scores: data,
                                            error: error_message
                                        }));
            this.$el.attr('id', this.pageId.slice(1));

            this.loader = this.$el.find('.scores-wrapper__loading-indicator');
 
            return this;
        },

        show: function () {
            this.render();
            this.$el.show();

            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });

            var self = this;
            scoresCollection.retrieve(10,
                {
                    before: function() {
                        self.loader.show();
                    },

                    success: function() {
                        self.totalShow();
                    },

                    fail: function(data) {
                        self.loader.hide();
                        self.totalShow(data.message);
                    }
                });
            this.hidden = false;
        },

        totalShow: function(error_message) {
            this.render(scoresCollection.toJSON(), error_message);
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        }

    });

    return new ScoreboardView();
});