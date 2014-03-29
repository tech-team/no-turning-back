define([
    'backbone',
    'tmpl/scoreboard',
    'collections/scores',
    'views/viewmanager'
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

            var self = this;
            $(document).on("scoresRetrieving", function(event) {
                $(self.scoresTable).hide();
                $(self.loader).show();
                console.log("scoresRetrieving");
            });

            $(document).on("scoresRetrieved", function(event) {
                self.totalShow();
                //self.$el.find(self.loader).hide();
                //self.$el.find(self.scoresTable).show();
                
                console.log("scoresRetrieved");
            });

            $(document).on("scoresRetrievingFailed", function(event) {
                $(self.loader).hide();
                console.log("scoresRetrievingFailed");
            });

            this.render();
            this.$el.find(this.pageId).show();
        },

        render: function (data) {
            if (typeof (data) === 'undefined') {
                data = [];
            }
            var p = document.getElementById(this.pageId.slice(1));
            if (p !== null)
                p.parentNode.removeChild(p);

            var p = $(this.template({scores: data}));
            p.attr("id", this.pageId.slice(1));
            p.appendTo(this.$el);
 
            return this;
        },

        show: function () {
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            scoresCollection.retrieve(10);
        },

        totalShow: function() {
            this.render(scoresCollection.toJSON());
            this.$el.find(this.pageId).show();
        },

        hide: function () {
            $(self.scoresTable).hide();
            this.$el.find(this.pageId).hide();
        }

    });

    return new ScoreboardView();
});