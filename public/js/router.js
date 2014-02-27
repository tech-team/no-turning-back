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
            ScoreboardView.hide();
            GameView.hide();
            
            MainView.show();
        },
        scoreboardAction: function () {
            MainView.hide();
            GameView.hide();

            ScoreboardView.show();
        },
        gameAction: function () {
            MainView.hide();
            ScoreboardView.hide();

            GameView.show();
        }
    });

    return new Router();
});