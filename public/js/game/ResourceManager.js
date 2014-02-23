define([
    'classy'
], 
function(Class) {

    var ResourceManager = Class.$extend({
        __init__: function() {
            this.tiles = [];
            this.sounds = [];
        },

        __classvars__: {
            TileType : {
                Floor: 0,
                Wall: 1
            }
        },

        loadLevel: function(level) {
            this.tiles = [];

            for (var i = 0; i < level.textures.length; ++i) {
                this.tiles[i] = new Image();
                this.tiles[i].src = level.textures[i];
            }

            this.sounds = [];
        },

        getSprite: function(id) {
            return this.tiles[id];
        },

        getSound: function(id) {
            return this.sounds[id];
        }
        
    });
    
    return ResourceManager;
});