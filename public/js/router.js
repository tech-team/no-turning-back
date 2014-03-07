define([
    'backbone',
    'views/main',
    'views/scoreboard',
    'views/game',
    'views/editor'
], 
function(Backbone, MainView, ScoreboardView, GameView, EditorView) {
    var Router = Backbone.Router.extend({
        routes: {
            'scoreboard': 'scoreboardAction',
            'game': 'gameAction',
            'editor': 'editorAction',
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
        },
        editorAction: function () {
            EditorView.show();
        }
    });

    return new Router();
});