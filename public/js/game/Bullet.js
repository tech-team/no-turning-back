define([
    'classy',
    'game/GameObject'
],
    function(Class, GameObject) {
        var Bullet = GameObject.$extend({
            __init__: function(dispObj, data) {
                this.setDispObj(dispObj); //or kinda super(dispObj)
                this.power = 10;
                this.speed = 5;
            },

            update: function(event) {
                this.dispObj.x += this.speed * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.y += this.speed * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
            }
        });

        return Bullet;
    });
