define([
    'game/weapons/AbstractWeapon'
], function(Weapon) {
    var Knife = Weapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data, true);
        },

        shoot: function(level) {
            var targets = level.zombies;
            var player = level.player;

            var hit = false;
            for (var i = 0; i < targets.length; ++i) {
                var xToZombie = player.dispObj.x - targets[i].dispObj.x;
                var yToZombie = player.dispObj.y - targets[i].dispObj.y;
                var distanceToZombie = Math.sqrt(xToZombie * xToZombie + yToZombie * yToZombie);

                if (distanceToZombie <= this.reach) {
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