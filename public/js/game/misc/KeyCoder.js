define([
	'classy',
    'jquery',
    'underscore'
],
function(Class, $, _) {
	var KeyCoder = Class.$extend({
		__init__: function(editorMode) {
			this.keys = [];
			var self = this;

            this.listeners = [];

            var listener = null;
            if (editorMode)
                listener = $('#editor-field');
            else
                listener = $(document);

            listener.keydown(function(event) {
				self.keys[event.keyCode] = true;

                _.each(self.listeners, function(el) {
                    if (el.event === "keydown" && el.key === event.keyCode)
                        el.handler(event);
                });
			});

            listener.keyup(function(event) {
                self.keys[event.keyCode] = false;

                _.each(self.listeners, function(el) {
                    if (el.event === "keyup" && el.keyCode === event.keyCode) {
                        el.handler(event);
                    }
                });
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

		__classvars__: {
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