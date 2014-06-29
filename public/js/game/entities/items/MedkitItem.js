define([
    'game/entities/items/AbstractItem',
    'game/misc/Messenger'
], function(AbstractItem, Messenger) {
    var MedkitItem = AbstractItem.$extend({
        __init__: function(dispObj) {
            this.$super(dispObj);
        },

        size: function() {
            return this._rawData().size;
        },

        apply: function(player, noMessaging) {
            player.heal(this.size());

            //please note, that amount of health to be healed is unpredictable
            //because player can be hurt in process
            if (!noMessaging)
                Messenger.showMessage(Messenger.healPackPicked, this.size());
        }
    });

    return MedkitItem;
});