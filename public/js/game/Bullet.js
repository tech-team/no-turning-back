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
                //TODO: change self position using speed and angle
                //TODO: test for collisions after that (in the game_main)
            },

            render: function() {

            }
        });

        return Bullet;
    });