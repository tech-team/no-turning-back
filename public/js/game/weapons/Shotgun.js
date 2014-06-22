define([
    'game/weapons/AbstractWeapon',
    'game/entities/Bullet'
], function(Weapon, Bullet) {
    var Shotgun = Weapon.$extend({
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
                type: "bullet"
            };

            for (var i = 0; i < this.data.bulletNum; ++i) {

                bulletData.r = player.dispObj.rotation -
                    (Math.floor(this.data.bulletNum/2) - i) * this.data.dispersion;
                bulletData.power = this.data.power;
                bulletData.tex = "shotgun-bullet";
                bulletData.ttl = 8;

                var bullet = new Bullet(level.addToStage(bulletData), bulletData);

                level.bullets.push(bullet);
            }

            player.shootCooldown = this.data.coolDown;
            --this.ammo;

            return true;
        }
    });

    return Shotgun;
});