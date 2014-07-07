define([
	'classy',
    'jquery',
    'lodash'
],
function(Class, $, _) {
	var KeyCoder = Class.$extend({
		__init__: function(editorMode) {
			this.keys = [];
			var self = this;

            this.listeners = [];
            this.listener = null;
            if (editorMode)
                this.listener = $('#editor-field');
            else
                this.listener = $(document);


            this.keyEventsCallbacks = {
                keydown: function(event) {
                    self.keys[event.keyCode] = true;

                    _.each(self.listeners, function(el) {
                        if (el.event === "keydown" && el.key === event.keyCode)
                            el.handler(event);
                    });
                },
                keyup: function(event) {
                    self.keys[event.keyCode] = false;

                    _.each(self.listeners, function(el) {
                        if (el.event === "keyup" && el.keyCode === event.keyCode) {
                            el.handler(event);
                        }
                    });
                },
                keypress: function(event) {
                    _.each(self.listeners, function(el) {
                        if (el.event === "keypress" && el.keyCode === event.keyCode) {
                            el.handler(event);
                        }
                    });
                }
            };

            _.each(_.keys(this.keyEventsCallbacks), function(keyEvent) {
                self.listener.on(keyEvent, self.keyEventsCallbacks[keyEvent]);
            });
		},

        getKeys: function() {
			return {
				keys: this.keys
			};
		},

        addEventListener: function (event, keyCode, handler) {
            this.listeners.push({
                event: event,
                keyCode: keyCode,
                handler: handler
            });
        },

        removeAllListeners: function() {
            var self = this;

            this.listeners = [];
            this.keys = [];
        },

        removeAllEvents: function() {
            this.listener.off('keydown');
            this.listener.off('keypress');
            this.listener.off('keyup');
        },

		__classvars__: {
            //TODO: haha neozhidali? nemnogo staticheskih funkcii
            setStage: function(stage) {
                this.stage = stage;

                this.mousePos = {x: 0, y: 0};
                this.stage.on("stagemousemove", this.onMouseMove.bind(this));
            },

            onMouseMove: function(event) {
                this.mousePos = {
                    x: event.stageX,
                    y: event.stageY
                };
            },

            getMousePos: function() {
                return this.mousePos;
            },

            SHIFT: 16,
            CTRL: 17,
            SPACE: 32,
			LEFT_ARROW: 37,
			UP_ARROW: 38,
			RIGHT_ARROW: 39,
			DOWN_ARROW: 40,
            DEL: 46,
            ONE: 49,
            TWO: 50,
            THREE: 51,
            PLUS: 107,
            MINUS: 109,
            A: 65,
            B: 66,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            I: 73,
            K: 75,
            M: 77,
            O: 79,
            P: 80,
            Q: 81,
            S: 83,
            V: 86,
            W: 87,
            X: 88,
            Z: 90
		}
	});

	return KeyCoder;
});