define([
	'classy',
    'collision'
],
function(Class, collider) {
	var GameObject = Class.$extend({
		__init__: function(dispObj) {
			this.dispObj = dispObj;
		},

        _rawData: function() {
            return this.dispObj.data;
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

        collidesWith: function(otherObj) {
            var obj = otherObj.dispObj || otherObj;
            return collider.checkPixelCollision(this.dispObj, obj);
        },

		update: function(event) {
			
		}
	});

	return GameObject;
});