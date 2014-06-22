define([
    'game/weapons/Knife',
    'game/weapons/Pistol',
    'game/weapons/Shotgun'
], function(Knife, Pistol, Shotgun) {
    return {
        knife: Knife,
        pistol: Pistol,
        shotgun: Shotgun
    };
});