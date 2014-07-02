define([
        'backbone',
        'utils/Message',
        'views/viewmanager',
        'views_j/lobby',
        'views_j/controls'
    ],
    function(Backbone, Message, ViewManager, LobbyView, ControlsView) {
        var Router = Backbone.Router.extend({
            routes: {
                'j': 'controlsAction',
                '*default': 'defaultActions'
            },

            jConnector: null,
            messenger: new Message(ViewManager.$el),

            goTo: function(where) {
                this.navigate(where, {trigger: true});
            },

            initialize: function() {
                ViewManager.setRouter(this);
                ViewManager.addView(LobbyView);
                ViewManager.addView(ControlsView);

                LobbyView.setMessenger(this.messenger);
                ControlsView.setMessenger(this.messenger);

                var self = this;
                LobbyView.on('joystickStarted', function(jConnector) {
                    self.jConnector = jConnector;
                    ControlsView.setJConnector(self.jConnector);
                    self.goTo(ControlsView.pageId);
                });

                ControlsView.on('JReconnect', function(noNotification) {
                    console.log('on JReconnect');
                    if (noNotification)
                        ControlsView.disableConfirm();
                    self.goTo(LobbyView.pageId);
                });
            },

            defaultActions: function () {
                LobbyView.setJConnector(this.jConnector);
                ViewManager.show(LobbyView);
            },

            controlsAction: function () {
                if (!this.jConnector) {
                    this.goTo(LobbyView.pageId);
                } else {
                    ViewManager.show(ControlsView);
                }
            }
        });

        return new Router();
    });