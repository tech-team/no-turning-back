
define([], function() {

    ResourceManager.prototype.SpriteType = {
        Floor: 0,
        Wall: 1
    };

    function ResourceManager() {
        this.sprites = [];
        this.sprites[ResourceManager.SpriteType.Wall] = new Sprite("res/gfx/wall.png");
    }

    ResourceManager.prototype.getSprite = function(id) {
        return sprites[id];
    }

    ResourceManager.prototype.getSound = function(id) {
        return sounds[id];
    }

    return ResourceManager;
})