define([
    'classy'
], function(Class) {
    var Weapon = Class.$extend({
        __init__: function(ammo, data, immediate) {
            this.ammo = ammo || 1;
            this.data = data;
            this.reach = 50;
            this.immediate = immediate;
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