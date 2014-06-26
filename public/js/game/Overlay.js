define([
    'classy',
    'lodash',
    'easel',
    'game/ResourceManager',
    'game/misc/UntilTimer'
],
    function(Class, _, easeljs, ResourceManager, UntilTimer) {
        var Overlay = Class.$extend({
            __init__: function(gameLevel) {
                this.gameLevel = gameLevel;
            },

            setArmor: function(value) {

            },

            setHealth: function(value) {

            },

            setAmmo: function(current, absolute) {

            },

            setWeapon: function(id, name) {

            },

            setKey: function(name) {

            },

            resize: function() {

            }
        });
        
        return Overlay;
    }
);