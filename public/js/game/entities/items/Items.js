define([
    'game/entities/items/WeaponItem',
    'game/entities/items/AmmoItem',
    'game/entities/items/MedkitItem',
    'game/entities/items/ArmorItem',
    'game/entities/items/KeyItem',
    'game/entities/items/DefaultItem'
], function(WeaponItem, AmmoItem, MedkitItem, ArmorItem, KeyItem, DefaultItem) {
    var availableItems = {
        weapon: WeaponItem,
        ammo: AmmoItem,
        medkit: MedkitItem,
        armor: ArmorItem,
        key: KeyItem,
        default: DefaultItem
    };

    return {
        createItem: function(itemData) {
            var type = itemData.type || itemData.data.type;
            return new availableItems[type](itemData);
        }
    };
});