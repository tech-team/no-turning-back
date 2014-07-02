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
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        },

        setJConnector: function(jConnector) {
            var callbacks = {
                onStart: this.onJStart.bind(this),
                onMessage: this.onMessage.bind(this),
                onStatusChanged: this.onStatusChanged.bind(this),
                onDisconnect: this.onDisconnect.bind(this)
            };

            this.jConnector = jConnector;
            this.jConnector.setCallbacks(callbacks);
        },

        onJStart: function() {

        },

        onMessage: function(data) {
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
            this.messenger.showMessage("You were disconnected", false, function() {
                location.reload();
            });
        },

        disconnect: function(sendToClient) {
            localStorage.removeItem('playerguid');
            if (sendToClient) {
                window.serverSend({
                    type: "disconnect"
                });
            }
            window.server.disconnect();
        }

    });

    return new ControlsView();
});