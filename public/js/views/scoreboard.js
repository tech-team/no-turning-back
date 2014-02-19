define([
    'backbone',
    'tmpl/scoreboard',
    'collections/scores'
], 
function(Backbone, tmpl, ScoresCollection) {
    var View = Backbone.View.extend({

        template: tmpl,
        scores: ScoresCollection,
        el: '#page',

        initialize: function () {
            // TODO
        },
        render: function () {
            console.log(this.scores.models);
            this.$el.html(this.template({scores: this.scores.models}));
        },
        show: function () {
            
        },
        hide: function () {
            // TODO
        }

    });

    return new View();
});