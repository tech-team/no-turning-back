define([
    'game/weapons/AbstractWeapon'
], function(Weapon) {
    var MeleeWeapon = Weapon.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data, true);
        },

        shoot: function(source, targets) {
            throw "Shoot is not implemented";
        }
    });

    return MeleeWeapon;
});