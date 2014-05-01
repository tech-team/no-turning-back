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
                        el.handler(el);
                });
			});

            listener.keyup(function(event) {
                self.keys[event.keyCode] = false;

                _.each(self.listeners, function(el) {
                    if (el.event === "keyup" && el.keyCode === event.keyCode) {
                        el.handler(el);
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
            ONE: 49,
            TWO: 50,
            THREE: 51,
            PLUS: 107,
            MINUS: 109,
            A: 65,
            D: 68,
            E: 69,
            I: 73,
            K: 75,
            M: 77,
            O: 79,
            Q: 81,
            S: 83,
            W: 87,
            X: 88,
            Z: 90
		}
	});

	return KeyCoder;
});