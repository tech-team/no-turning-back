define([
    'lodash',
    'classy'
], function(_, Class) {
    var Vector = Class.$extend({
        __init__: function(x, y) {
            if (_.isUndefined(y) && _.isObject(x)) {
                this.x = x.x || 0;
                this.y = x.y || 0;
            } else {
                this.x = x || 0;
                this.y = y || 0;
            }
        },

        __classvars__: {
            distance: function(vec1, vec2) {

            },

            angle: function(vec1, vec2) {

            }
        },

        distanceSq: function() {
            return this.x * this.x + this.y * this.y;
        },

        distance: function() {
            return Math.sqrt(this.distanceSq());
        },

        angle: function() {
            return Math.atan2(this.y, this.x);
        }
    });

    return Vector;
});