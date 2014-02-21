define([
    'backbone',
    'tmpl/scoreboard',
    'collections/scores'
], 
function(Backbone, scoreboardTmpl, scoresCollection) {
    var ScoreboardView = Backbone.View.extend({

        template: scoreboardTmpl,
        el: '#page',

        initialize: function () {
            // TODO
        },

        render: function () {
            scoresCollection.sortByScore();
            console.log(scoresCollection.models);
            this.$el.html(this.template({scores: scoresCollection.toJSON()}));
 
            return this;
        },

        show: function () {
            
        },
        hide: function () {
            // TODO
        }

    });

    return new ScoreboardView();
});