define([
	'classy',
    'underscore',
    'easel',
    'preload'
],
function(Class, _, createjs, preloadjs) {
	var ResourceManager = Class.$extend({
		__init__: function(onComplete, onCompleteContext) {
            this.textures = [];
            this.sounds = [];

            var self = this;

            var queue = new preloadjs.LoadQueue();
            queue.on("complete", handleComplete, this);

            var manifest = [
                {id: "ground",  src:"ground.png", w: 32, h: 32},
                {id: "zombie",  src:"zombie.png", w: 32, h: 32},
                {id: "player",  src:"player.png", w: 32, h: 32},
                {id: "wall",    src:"wall.png", w: 32, h: 32},
                {id: "chest",   src:"chest.png", w: 32, h: 32},
                {id: "door",    src:"door.png", w: 32, h: 32},
                {id: "rubbish", src:"rubbish.png", w: 32, h: 32},
            ];

            queue.loadManifest(manifest, true, "res/gfx/");

            function handleComplete() {
                _.each(manifest, function(tex) {
                    var data = {
                        images: [queue.getResult(tex.id)],
                        frames: {
                            width: tex.w,
                            height: tex.h
                        }
                    };

                    self.textures[tex.id] = new createjs.SpriteSheet(data);

                });
                onComplete.call(onCompleteContext);
            }
		},

        getTexture: function(name) {
            return this.textures[name];
        }
	});

	return ResourceManager;
});