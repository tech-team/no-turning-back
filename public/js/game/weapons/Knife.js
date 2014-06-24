define([
    'game/weapons/AbstractWeapon',
    'game/misc/Vector'
], function(Weapon, Vector) {
    var Knife = Weapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data, true);
        },

        shoot: function(level) {
            var targets = level.zombies;
            var player = level.player;

            var hit = false;
            for (var i = 0; i < targets.length; ++i) {
                var toZombie = new Vector({
                    x: player.dispObj.x - targets[i].dispObj.x,
                    y: player.dispObj.y - targets[i].dispObj.y
                });

                if (toZombie.distance() <= level.player.$class.Reach) {
                    targets[i].health -= this.data.power;
                    hit = true;
                }
            }

            player.shootCooldown = this.data.coolDown;

            return hit;
        }
    });

    return Knife;
});