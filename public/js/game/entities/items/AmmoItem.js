define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var AmmoItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        __classvars__: {
        },

        name: function() {
            return this._rawData().name;
        },

        size: function() {
            return this._rawData().size;
        },

        apply: function(player, noMessaging) {
            var name = this.name();
            var size = this.size();

            if (player.hasWeapon(name)) {
                player.addAmmo(name, size);

                if (!noMessaging)
                    Messenger.showMessage(Messenger.ammoPicked, size, name);
            }
        }
    });

    return AmmoItem;
});