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
        loader: '.scores-wrapper__loading-indicator',
        scoresTable: '.scores',

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
 
            return this;
        },

        show: function () {
            this.$el.show();

            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });

            // var self = this;
            // scoresCollection.retrieve(10,
            //     {
            //         before: function() {
            //             $(self.scoresTable).hide();
            //             self.totalShow();
            //             $(self.loader).show();
            //             console.log("scoresRetrieving");
            //         },

            //         success: function(data) {
            //             self.totalShow();
            //             //self.$el.find(self.loader).hide();
            //             //self.$el.find(self.scoresTable).show();
                        
            //             console.log("scoresRetrieved");
            //         },

            //         fail: function(data) {
            //             $(self.loader).hide();
            //             self.totalShow(data.message);
            //             console.log("scoresRetrievingFailed");
            //         }
            //     });
        },

        totalShow: function(error_message) {
            this.render(scoresCollection.toJSON(), error_message);
            this.$el.show();
        },

        hide: function () {
            // $(self.scoresTable).hide();
            this.$el.hide();
        }

    });

    return new ScoreboardView();
});