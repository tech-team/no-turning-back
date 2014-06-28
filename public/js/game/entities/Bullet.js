define([
    'game/entities/GameObject'
],
    function(GameObject) {
        var Bullet = GameObject.$extend({
            __init__: function(dispObj) {
                this.$super(dispObj);

                this.power = dispObj.data.power;
                this.speed = 10;
                this.source = dispObj.data.source;
                this.ttl = dispObj.data.ttl || null;
            },

            update: function(event) {
                this.dispObj.x += this.speed * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.y += this.speed * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
            }
        });

        return Bullet;
    });
