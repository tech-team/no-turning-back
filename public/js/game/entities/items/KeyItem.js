define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var KeyItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        name: function() {
            return this._rawData().name;
        },

        apply: function(player, noMessaging) {
            var name = this.name();

            if (!(name in player.keys())) {
                player.addToKeys(name);

                if (!noMessaging)
                    Messenger.showMessage(Messenger.keyPicked, name);
            }
        }
    });

    return KeyItem;
});