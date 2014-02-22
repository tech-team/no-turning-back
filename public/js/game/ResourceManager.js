define([
    'classy'
], 
function(Class) {

    var ResourceManager = Class.$extend({
        __init__: function() {
            this.SpriteType = {
                Floor: 0,
                Wall: 1
            };

            this.sprites = [];
            //this.sprites[this.SpriteType.Wall] = new Sprite("res/gfx/wall.png");

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
})