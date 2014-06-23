define([
    'classy'
], function(Class) {
    var Weapon = Class.$extend({
        __init__: function(ammo, data, melee) {
            this.ammo = ammo || 1;
            this.data = data;
            this.reach = 50;
            this.melee = melee;
        },

        addAmmo: function(ammo) {
            this.ammo += ammo;
        },

        shoot: function(level) {
            throw "Pure weapon. Not available";
        }
    });

    return Weapon;
});