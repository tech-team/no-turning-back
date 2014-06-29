define([
    'game/entities/items/WeaponItem',
    'game/entities/items/AmmoItem',
    'game/entities/items/MedkitItem',
    'game/entities/items/KeyItem',
    'game/entities/items/DefaultItem'
], function(WeaponItem, AmmoItem, MedkitAmmo, KeyItem, DefaultItem) {
    return {
        weapon: WeaponItem,
        ammo: AmmoItem,
        medkit: MedkitAmmo,
        key: KeyItem,
        default: DefaultItem
    };
});