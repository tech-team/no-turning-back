define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__: function(dispObj) {
			this.dispObj = dispObj;
		},

        setDispObj: function(dispObj) {
            this.dispObj = dispObj;
        },

		update: function(event) {
			
		}
	});

	return GameObject;
});