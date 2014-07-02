define([
        'backbone',
        'views/viewmanager',
        'views_j/lobby',
        'views_j/controls'
    ],
    function(Backbone, ViewManager, LobbyView, ControlsView) {
        var Router = Backbone.Router.extend({
            routes: {
                'joystick': 'controlsAction',
                '*default': 'defaultActions'
            },
            initialize: function() {
                ViewManager.setRouter(this);
                ViewManager.addView(LobbyView);
                ViewManager.addView(ControlsView);
            },

            defaultActions: function () {
                ViewManager.show(LobbyView);
            },

            controlsAction: function () {
                ViewManager.show(ControlsView);
            }
        });

        return new Router();
    });