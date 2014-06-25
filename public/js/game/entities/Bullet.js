define([
    'classy',
    'game/entities/GameObject'
],
    function(Class, GameObject) {
        var Bullet = GameObject.$extend({
            __init__: function(objectData, dispObj) {
                this.$super(objectData, dispObj);

                this.power = objectData.power;
                this.speed = 10;
                this.source = objectData.source;
                this.ttl = objectData.ttl || null;
            },

            update: function(event) {
                this.dispObj.x += this.speed * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.y += this.speed * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
            }
        });

        return Bullet;
    });
