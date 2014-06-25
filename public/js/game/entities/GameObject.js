define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__: function(dispObj) {
			this.dispObj = dispObj;
		},

        data: function() {
            this.dispObj.data.x = this.dispObj.x;
            this.dispObj.data.y = this.dispObj.y;
            this.dispObj.data.r = this.dispObj.rotation;
            return this.dispObj.data;
        },

        setDispObj: function(dispObj) {
            this.dispObj = dispObj;
        },

        x: function() {
            return this.dispObj.x;
        },

        y: function() {
            return this.dispObj.y;
        },

        rotation: function() {
            return this.dispObj.rotation;
        },

		update: function(event) {
			
		}
	});

	return GameObject;
});