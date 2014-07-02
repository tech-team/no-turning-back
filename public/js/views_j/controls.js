define([
    'views/baseView',
    'tmpl_j/controls',
    'joystick/Controller',
    'utils/Message'
], function(BaseView, tmpl, Controller, Messenger) {
    var ControlsView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#j',
        hidden: true,

        jConnector: null,
        controller: null,

        $canvas: null,
        messenger: null,

        confirmDisabled: false,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.$canvas = this.$('canvas');
            this.controller = new Controller(this.$canvas[0], function() {});
            this.messenger = new Messenger(this.$el);

            return this;
        },

        show: function () {
            this.$el.show();
            this.hidden = false;
            this.confirmDisabled = false;
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        },

        disableConfirm: function() {
            this.confirmDisabled = true;
        },

        confirm: function(callbacks) {
            callbacks = this._getConfirmCallbacks(callbacks);

            if (this.confirmDisabled) {
                callbacks.yes();
                return;
            }

            var self = this;
            var controls = [
                {
                    name: "Yes",
                    action: function(event) {
                        window.server.forceReconnect();
                        self.messenger.hideMessage();
                        callbacks.yes();
                    }
                },
                {
                    name: "No",
                    action: function(event) {
                        self.messenger.hideMessage();
                        callbacks.no();
                    }
                }
            ];
            this.messenger.showMessage("Do you really want to reconnect?", true, null, controls);
        },

        setJConnector: function(jConnector) {
            var callbacks = {
                onStart: this.onJStart.bind(this),
                onMessage: this.onMessage.bind(this),
                onStatusChanged: this.onStatusChanged.bind(this),
                onDisconnect: this.onDisconnect.bind(this),
                onForceReconnect: this.onForceReconnect.bind(this)
            };

            this.jConnector = jConnector;
            this.jConnector && this.jConnector.addCallbacks(callbacks);
        },

        onJStart: function() {

        },

        onMessage: function(data, answer) {
//            switch (data.type) {
//                case "info":
//                    if (data.action === "gamefinished") {
//                        this.messenger.showMessage(data.message, false);
//                    }
//                    else if (data.action === "gameStateChanged") {
//                        if (data.arg === "pause")
//                            this.messenger.showMessage("Game paused", true);
//                        else if (data.arg === "play")
//                            this.messenger.hideMessage();
//                    }
//                    break;
//                case "disconnect":
//                    this.disconnect();
//                    break;
//            }
        },

        onStatusChanged: function() {

        },

        onDisconnect: function() {
            var self = this;
            this.messenger.showMessage("You were disconnected. Try reloading the page.", true);
        },

        onForceReconnect: function(noNotification) {
            this.trigger('JReconnect', noNotification);
        },

        disconnect: function(sendToClient) {
//            localStorage.removeItem('playerguid');
//            if (sendToClient) {
//                window.serverSend({
//                    type: "disconnect"
//                });
//            }
//            window.server.disconnect();
        }

    });

    return new ControlsView();
});