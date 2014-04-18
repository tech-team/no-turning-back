define([
	'classy',
    'jquery'
],
function(Class, $) {
	var KeyCoder = Class.$extend({
		__init__: function(editorMode) {
			this.keys = [];
			var self = this;

            var listener = null;
            if (editorMode)
                listener = $('#editor-field');
            else
                listener = $(document);

            listener.keydown(function(event) {
				self.keys[event.keyCode] = true;
			});

            listener.keyup(function(event) {
                self.keys[event.keyCode] = false;
            });
		},

		getKeys: function() {
			return {
				keys: this.keys
			};
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
            A: 65,
            D: 68,
            E: 69,
            I: 73,
            K: 75,
            O: 79,
            Q: 81,
            S: 83,
            W: 87,
            Z: 90
		}
	});

	return KeyCoder;
});