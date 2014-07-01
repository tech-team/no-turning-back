define([
    'backbone',
    'views/viewmanager',
    'views/main',
    'views/scoreboard',
    'views/game',
    'views/editor'
], 
function(Backbone, ViewManager, MainView, ScoreboardView, GameView, EditorView) {
    var Router = Backbone.Router.extend({
        routes: {
            'scoreboard': 'scoreboardAction',
            'game': 'gameAction',
            'editor': 'editorAction',
            '*default': 'defaultActions'
        },
        initialize: function() {
            ViewManager.addView(MainView);
            ViewManager.addView(ScoreboardView);
            ViewManager.addView(GameView);
            ViewManager.addView(EditorView);
        },

        defaultActions: function () {
            ViewManager.show(MainView);
//            MainView.show();
        },

        scoreboardAction: function () {
            ViewManager.show(ScoreboardView);
//            ScoreboardView.show();
        },

        gameAction: function () {
            ViewManager.show(GameView);
//            GameView.show();
        },

        editorAction: function () {
            ViewManager.show(EditorView);
//            EditorView.show();
        }
    });

    return new Router();
});