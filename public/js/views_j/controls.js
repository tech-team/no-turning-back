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

        canvas: null,
        messenger: null,

        confirmDisabled: false,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$('canvas')[0];
            return this;
        },

        show: function () {
            var self = this;

            var $window = $(window);

            this.canvas.width = $window.width();
            this.canvas.height = $window.height();

            this.controller = new Controller(this.canvas);
            $window.resize(function() {
                self.canvas.width = $window.width();
                self.canvas.height = $window.height();
                self.controller.resize();
            });

            $window.on("deviceorientation", this.controller.onGyro.bind(this.controller), false);

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

        enableConfirm: function() {
            this.confirmDisabled = false;
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

        setMessenger: function(messenger) {
            this.messenger = messenger;
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
            console.warn('hi');
        },

        onMessage: function(data, answer) {
            //TODO: everything below looks really weird :(

            switch (data.type) {
                case "info":
                    if (data.action === "gamefinished") {
                        this.messenger.showMessage(data.message, false);
                    }
                    else if (data.action === "gameStateChanged") {
                        if (data.arg === "pause")
                            this.messenger.showMessage("Game paused", true);
                        else if (data.arg === "play")
                            this.messenger.hideMessage();
                    }
                    break;

                case 'game':
                    if (data.action == 'newWeapon') {
                        this.controller.addWeapon(data.weapon);
                    }
                    else if (data.action == 'weaponChange') {
                        this.controller.selectWeapon(data.name);
                    }
                    else if (data.action == 'availableWeapons') {
                        this.controller.setAvailableWeapons(data.availableWeapons);
                        this.controller.selectWeapon(data.currentWeapon);
                    }
                    break;

                default:
                    console.error("Unsupported message received: ", data);
                    break;
            }
        },

        onStatusChanged: function() {
            throw "controls.js onStatusChanged";
        },

        onDisconnect: function() {
            var self = this;
            this.messenger.showMessage("You were disconnected. Try reloading.", true);
        },

        onForceReconnect: function(noNotification) {
//            if (noNotification)
                this.messenger.hideMessage();
            this.trigger('JReconnect', noNotification);
        }
    });

    return new ControlsView();
});