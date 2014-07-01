define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var ArmorItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        size: function() {
            return this._rawData().size;
        },

        apply: function(player, noMessaging) {
            player.addArmor(this.size());

            //please note, that amount of health to be healed is unpredictable
            //because player can be hurt in process
            if (!noMessaging)
                Messenger.showMessage(Messenger.armorPicked, this.size());
        }
    });

    return ArmorItem;
});