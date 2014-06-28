define([
    'game/weapons/Fist',
    'game/weapons/Knife',
    'game/weapons/Pistol',
    'game/weapons/Shotgun'
], function(Fist, Knife, Pistol, Shotgun) {
    return {
        fist: Fist,
        knife: Knife,
        pistol: Pistol,
        shotgun: Shotgun
    };
});