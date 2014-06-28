define([
    'game/weapons/AbstractWeapon'
], function(Weapon) {
    var RangeWeapon = Weapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data, false);
        },

        shoot: function(sourceName, source, level) {
            throw "Shoot is not implemented";
        }
    });

    return RangeWeapon;
});