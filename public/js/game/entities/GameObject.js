define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__: function(objectData, dispObj) {
            this._data = objectData;
			this.dispObj = dispObj;
		},

        setObjectData: function(objectData) {
            this._data = objectData;
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