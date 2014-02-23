define([
    'classy'
],
    function(Class) {

        var Bullet = Class.$extend({
            __init__: function(x, y, speed, angle) {
                this.x = x;
                this.y = y;
                this.speed = speed;
                this.angle = angle;
            },

            update: function() {
                this.x =
            }
        });

        return Bullet;
    });