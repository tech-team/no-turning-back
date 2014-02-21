define([
    'backbone',
    'tmpl/scores_row',
    'tmpl/scoreboard',
    'collections/scores'
], 
function(Backbone, scoresRowTmpl, scoreboardTmpl, scoresCollection) {
    var ScoreboardView = Backbone.View.extend({

        template: scoreboardTmpl,
        scoresRowTemplate: scoresRowTmpl,
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