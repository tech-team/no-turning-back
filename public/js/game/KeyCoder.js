define([
	'classy'
],
function(Class) {
	var KeyCoder = Class.$extend({
		__init__: function() {
			this.keys = [];
			var self = this;
			document.onkeydown = function(event) {
				self.keys[event.keyCode] = true;
			};

			document.onkeyup = function(event) {
				self.keys[event.keyCode] = false;
			};
		},

		getKeys: function() {
			return {
				keys: this.keys
			};
		},

		__classvars__: {
            SHIFT: 16,
			LEFT_ARROW: 37,
			UP_ARROW: 38,
			RIGHT_ARROW: 39,
			DOWN_ARROW: 40,
            A: 65,
            D: 68,
            S: 83,
            W: 87
		}
	});

	return KeyCoder;
});