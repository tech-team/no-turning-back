define([
    'game/weapons/RangeWeapon',
    'game/entities/Bullet'
], function(RangeWeapon, Bullet) {
    var Pistol = RangeWeapon.$extend({
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
                tex: 'pistol-bullet'
            };
            var bullet = new Bullet(level.addToStage(bulletData));
            level.bullets.push(bullet);

            --this.ammo;

            return true;
        }
    });

    return Pistol;
});