define([
    'backbone',
    'tmpl/scoreboard',
    'collections/scores',
    'views/viewmanager',
], 
function(Backbone, scoreboardTmpl, scoresCollection, ViewManager) {
    var ScoreboardView = Backbone.View.extend({

        template: scoreboardTmpl,
        el: '#pages',
        pageId: '#scoreboardPage',
        loader: '.scores-wrapper__loading-indicator',
        scoresTable: '.scores',

        initialize: function () {
            ViewManager.addView(this.pageId, this);
            this.render();
        },

        render: function (data, error_message) {
            if (typeof (data) === 'undefined') {
                data = [];
            }
            var p = document.getElementById(this.pageId.slice(1));
            if (p !== null)
                p.parentNode.removeChild(p);

            var p = $(this.template({
                                        scores: data,
                                        error: error_message
                                    }));
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);
 
            return this;
        },

        show: function () {
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });

            var self = this;
            scoresCollection.retrieve(10,
                {
                    before: function() {
                        $(self.scoresTable).hide();
                        $(self.loader).show();
                        console.log("scoresRetrieving");
                    },

                    success: function(data) {
                        self.totalShow();
                        //self.$el.find(self.loader).hide();
                        //self.$el.find(self.scoresTable).show();
                        
                        console.log("scoresRetrieved");
                    },

                    fail: function(data) {
                        $(self.loader).hide();
                        self.totalShow(data.message);
                        console.log("scoresRetrievingFailed");
                    }
                });
        },

        totalShow: function(error_message) {
            this.render(scoresCollection.toJSON(), error_message);
            this.$el.find(this.pageId).show();
        },

        hide: function () {
            $(self.scoresTable).hide();
            this.$el.find(this.pageId).hide();
        }

    });

    return new ScoreboardView();
});