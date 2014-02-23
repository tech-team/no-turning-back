define([
    'classy'
], 
function(Class) {

    var ResourceManager = Class.$extend({
        __init__: function() {
            this.sprites = [];
            //this.sprites[this.SpriteType.Wall] = new Sprite("res/gfx/wall.png");

            this.sounds = [];
        },

        __classvars__: {
            SpriteType : {
                Floor: 0,
                Wall: 1
            }
        },

        loadLevel: function(level) {
            this.sprites = [];

            for (var i = 0; i < level.textures.length; ++i) {
                this.sprites[i] = new Image();
                this.sprites[i].src = level.textures[i];
            }

            this.sounds = [];
        },

        getSprite: function(id) {
            return this.sprites[id];
        },

        getSound: function(id) {
            return this.sounds[id];
        }
        
    });
    
    return ResourceManager;
});