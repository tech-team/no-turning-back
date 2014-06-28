define([
    'game/weapons/Fist'
], function(Fist) {
    var Knife = Fist.$extend({
        __init__: function(ammo, data) {
            this.$super(ammo, data);
        },

        shoot: function(source, targets) {
            return this.$super(source, targets);
        }
    });

    return Knife;
});