define([
    'backbone',
    'views/main',
    'views/scoreboard',
    'views/game'
], 
function(Backbone, MainView, ScoreboardView, GameView) {
    var Router = Backbone.Router.extend({
        routes: {
            'scoreboard': 'scoreboardAction',
            'game': 'gameAction',
            '*default': 'defaultActions'
        },
        defaultActions: function () {            
            MainView.show();
        },
        scoreboardAction: function () {
            ScoreboardView.show();
        },
        gameAction: function () {
            GameView.show();
        }
    });

    return new Router();
});