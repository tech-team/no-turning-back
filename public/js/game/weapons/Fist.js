define([
    'lodash',
    'game/weapons/MeleeWeapon',
    'game/misc/Vector'
], function(_, MeleeWeapon, Vector) {
    var Fist = MeleeWeapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data);
        },

        shoot: function(source, targets) {
            var hit = false;

            var self = this;
            var handler = function(target) {
                var toTarget = new Vector({
                    x: source.x() - target.x(),
                    y: source.y() - target.y()
                });

                if (toTarget.distance() <= source.$class.Reach) {
                    target.damage(self.data.power);
                    hit = true;
                }
            };

            if (_.isArray(targets)) {
                _.each(targets, handler);
            } else {
                handler(targets);
            }

            return hit;
        }
    });

    return Fist;
});