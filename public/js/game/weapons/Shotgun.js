define([
    'game/weapons/RangeWeapon',
    'game/entities/Bullet'
], function(RangeWeapon, Bullet) {
    var Shotgun = RangeWeapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data);
        },

        shoot: function(sourceName, source, level) {
            var bulletData = {
                x: source.x(),
                y: source.y(),
                r: source.rotation(),
                source: sourceName,
                type: "bullet",
                power: this.data.power,
                tex: "shotgun-bullet",
                ttl: this.data.ttl
            };

            for (var i = 0; i < this.data.bulletNum; ++i) {
                bulletData.r = source.rotation() -
                    (Math.floor(this.data.bulletNum/2) - i) * this.data.dispersion;

                var bullet = new Bullet(level.addToStage(bulletData));

                level.bullets.push(bullet);
            }
            --this.ammo;

            return true;
        }
    });

    return Shotgun;
});