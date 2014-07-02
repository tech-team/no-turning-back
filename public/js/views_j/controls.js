define([
    'views/baseView',
    'tmpl_j/controls',
    'joystick/Controller'
], function(BaseView, tmpl, Controller) {
    var ControlsView = BaseView.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#j',
        hidden: true,

        jConnector: null,
        controller: null,

        $canvas: null,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.$canvas = this.$('canvas');
            this.controller = new Controller(this.$canvas[0], function() {});

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

        onMessage: function() {

        },

        onStatusChanged: function() {

        },

        onDisconnect: function() {

        }

    });

    return new ControlsView();
});