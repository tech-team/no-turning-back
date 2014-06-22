define([
    'game/weapons/AbstractWeapon',
    'game/entities/Bullet'
], function(Weapon, Bullet) {
    var Pistol = Weapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data, false);
        },

        shoot: function(level) {
            var player = level.player;

            var bulletData = {
                x: player.dispObj.x,
                y: player.dispObj.y,
                r: player.dispObj.rotation,
                source: "player",
                type: "bullet",
                power: this.data.power,
                tex: 'pistol-bullet'
            };
            var bullet = new Bullet(level.addToStage(bulletData), bulletData);
            level.bullets.push(bullet);

            player.shootCooldown = this.data.coolDown;
            --this.ammo;

            return true;
        }
    });

    return Pistol;
});