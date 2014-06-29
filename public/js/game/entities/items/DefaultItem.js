define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var DefaultItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        name: function() {
            return this._rawData().name;
        },

        apply: function(player, noMessaging) {
            var name = this.name();

            if (name) {
                player.addToInventory(name);

                if (!noMessaging)
                    Messenger.showMessage(Messenger.newItemPicked, name);
            }
        }
    });

    return DefaultItem;
});