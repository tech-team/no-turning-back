define([
    'backbone',
    'views/main',
    'views/scoreboard',
    'views/game',
    'views/editor',
    'views/viewmanager'
], 
function(Backbone, MainView, ScoreboardView, GameView, EditorView, ViewManager) {
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