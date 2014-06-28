define([
    'classy'
], function(Class) {
    var Weapon = Class.$extend({
        __init__: function(ammo, data, melee) {
            this.ammo = ammo || null;
            this.totalAmmo = this.ammo;
            this.data = data;
            this.melee = melee;
        },

        addAmmo: function(ammo) {
            this.ammo += ammo;
            this.totalAmmo = this.ammo;
        },

        getAmmo: function() {
            return {
                current: this.ammo,
                total: this.totalAmmo //actually the rest of ammo
            };
        },

        hasAmmo: function() {
            return this.ammo > 0;
        },

        shoot: function(level) {
            throw "Pure weapon. Not available";
        }
    });

    return Weapon;
});