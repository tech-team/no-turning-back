
define([], function() {

    function ResourceManager() {
        this.SpriteType = {
            Floor: 0,
            Wall: 1
        };

        this.sprites = [];
        this.sprites[this.SpriteType.Wall] = new Sprite("res/gfx/wall.png");

        this.sounds = [];
    }



    ResourceManager.prototype.getSprite = function(id) {
        return this.sprites[id];
    }

    ResourceManager.prototype.getSound = function(id) {
        return this.sounds[id];
    }

    return ResourceManager;
})