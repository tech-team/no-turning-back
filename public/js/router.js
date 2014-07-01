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
            ViewManager.setRouter(this);
            ViewManager.addView(MainView);
            ViewManager.addView(ScoreboardView);
            ViewManager.addView(GameView);
            ViewManager.addView(EditorView);
        },

        defaultActions: function () {
            ViewManager.show(MainView);
        },

        scoreboardAction: function () {
            ViewManager.show(ScoreboardView);
        },

        gameAction: function () {
            ViewManager.show(GameView);
        },

        editorAction: function () {
            ViewManager.show(EditorView);
        }
    });

    return new Router();
});