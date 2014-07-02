define([
   'views/baseView',
   'tmpl_j/lobby',
   'utils/BrowserCheck',
   'device_normalizer',
   'joystick/JConnector',
   'utils/Message'
], function(BaseView, tmpl, checker, device_normalizer, JConnector, Message) {
    var LobbyView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#lobby',
        hidden: true,

        $tokenForm: null,
        $token: null,
        $connectorMessage: null,

        messenger: null,
        jConnector: null,

        static: {
            Orientation: {
                Portrait: 'portrait',
                Landscape: 'landscape'
            }
        },


        initialize: function () {
            window.scrollTo(0,1);
            mo.init();
            this.createWindowEvents();

            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.$tokenForm = this.$('#tokenForm');
            this.$token = this.$('#token');
            this.$connectorMessage = this.$('#message');

            this.messenger = new Message(this.$el);
            this.createEvents();

            return this;
        },

        setJConnector: function(jConnector, noRecreate) {
            var callbacks = {
                onStart: this.onJStart.bind(this),
                onMessage: this.onMessage.bind(this),
                onStatusChanged: this.onStatusChanged.bind(this),
                onDisconnect: this.onDisconnect.bind(this)
            };

            if (!this.jConnector) {

                if (jConnector) {
                    this.jConnector = jConnector;
                    this.jConnector.addCallbacks(callbacks);
                } else {
                    jConnector = new JConnector(this.$tokenForm, this.$token, callbacks);
                    this.jConnector = jConnector;
                }
            }
        },

        createWindowEvents: function() {
            window.addEventListener("orientationchange", function (e) {
                this.checkOrientation();
            }.bind(this), false);
        },

        removeWindowEvents: function() {
            window.removeEventListener("orientationchange");
        },

        createEvents: function() {
            this.$token.on('keyup', function(){
                this.$token.val(this.$token.val().toLocaleUpperCase());
            }.bind(this));
        },

        show: function () {
            this.$token.val('');
            this.$el.show();
            this.hidden = false;

            this.checkBrowserSupport() &&
            this.checkOrientation();
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        },

        onJStart: function() {
            this.trigger('joystickStarted', this.jConnector);
        },

        onMessage: function(data, answer) {

        },

        onStatusChanged: function(status) {
            this.$connectorMessage.text(status);
        },

        onDisconnect: function() {

        },

        onWrongToken: function() {
            this.messenger.showMessage("Wrong Token. Try Again");
        },



        getOrientation: function() {
            return window.orientation % 180 === 0 ? this.static.Orientation.Portrait
                                                  : this.static.Orientation.Landscape;
        },

        checkOrientation: function() {
            var orient = this.getOrientation();
            if (orient === this.static.Orientation.Portrait) {
                this.messenger.showMessage("Change device orientation to landscape", true);
                window.serverSend({
                    type: "orientation",
                    orientation: orient
                });
            }
            else {
                this.messenger.hideMessage();
            }
        },

        checkBrowserSupport: function() {
            if (!checker.browserSupport() /*|| !checker.touchSupport()*/) {
                this.messenger.showMessage("Your browser is not supported. Sorry", true);
                return false;
            }
            return true;
        }



    });

    return new LobbyView();
});