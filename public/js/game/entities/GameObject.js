define([
	'classy',
    'collision'
], function(Class, collider) {
	var GameObject = Class.$extend({
		__init__: function(dispObj) {
            if (dispObj && !dispObj.data) {
                this.dispObj = {
                                data: dispObj
                               };
            } else {
                this.dispObj = dispObj;
            }
		},

        _rawData: function() {
            return this.dispObj.data;
        },

        data: function() {
            this.dispObj.data.x = this.dispObj.x || null;
            this.dispObj.data.y = this.dispObj.y || null;
            this.dispObj.data.r = this.dispObj.rotation || null;
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

        type: function() {
            return this.dispObj.data.type;
        },

        tex: function() {
            return this.dispObj.data.tex;
        },

        setTex: function(newTex) {
            this.dispObj.data.tex = newTex;
        },

        name: function() {
            return this.dispObj.data.name;
        },

        w: function() {
            return this.dispObj.data.w;
        },

        h: function() {
            return this.dispObj.data.h;
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