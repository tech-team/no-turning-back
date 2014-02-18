define([
    'backbone',
    'views/main',
    'views/scoreboard',
    'views/game'
], function(Backbone, MainView, ScoreboardView, GameView) {
    var Router = Backbone.Router.extend({
        routes: {
            'scoreboard': 'scoreboardAction',
            'game': 'gameAction',
            '*default': 'defaultActions'
        },
        defaultActions: function () {
            var mainView = new MainView();
            mainView.show();
        },
        scoreboardAction: function () {
            // TODO
        },
        gameAction: function () {
            // TODO
        }
    });

    return new Router();
});