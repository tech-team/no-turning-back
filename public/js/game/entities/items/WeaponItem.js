define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var WeaponItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        __classvars__: {
            DefaultAmmo: 5
        },

        name: function() {
            return this._rawData().name;
        },

        ammo: function() {
            return this._rawData().ammo || this.$class.DefaultAmmo;
        },

        apply: function(player, noMessaging) {
            var name = this.name();
            var ammo = this.ammo();

            if (player.hasWeapon(name)) {
                player.addAmmo(name, ammo);

                if (!noMessaging)
                    Messenger.showMessage(Messenger.ammoPicked, ammo, name);
            }
            else {
                player.addWeapon(name, ammo);
                if (player.weapons[name].power() >= player.weapons[player.currentWeapon].power())
                    player.changeWeapon(name);

                if (!noMessaging)
                    Messenger.showMessage(Messenger.newWeaponPicked, name);
            }


        }
    });

    return WeaponItem;
});