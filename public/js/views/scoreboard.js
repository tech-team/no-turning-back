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

        initialize: function () {
            ViewManager.addView(this.pageId, this);
            this.render();
        },

        render: function () {
            scoresCollection.sortByScore();
            var p = $(this.template({scores: scoresCollection.toJSON()}));
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
        }

    });

    return new ScoreboardView();
});