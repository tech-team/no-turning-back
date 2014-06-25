define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__: function(objectData, dispObj) {
            this._data = objectData;
			this.dispObj = dispObj;
		},

        data: function() {
            this._data.x = this.dispObj.x;
            this._data.y = this.dispObj.y;
            this._data.rotation = this.dispObj.rotation;
            return this._data;
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