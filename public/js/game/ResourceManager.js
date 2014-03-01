define([
	'classy',
    'underscore',
    'preload'
],
function(Class, _, preload) {
	var ResourceManager = Class.$extend({
		__init__: function(onComplete, onCompleteContext) {
            this.textures = [];
            this.sounds = [];

            var self = this;

            var queue = new preload.LoadQueue();
            queue.on("complete", handleComplete, this);

            var manifest = [
                {id: "ground",  src:"ground.png"},
                {id: "zombie",  src:"zombie.png"},
                {id: "player",  src:"player.png"},
                {id: "wall",    src:"wall.png"},
                {id: "chest",   src:"chest.png"},
                {id: "door",    src:"door.png"},
                {id: "rubbish", src:"rubbish.png"},
            ];

            queue.loadManifest(manifest, true, "res/gfx/");

            function handleComplete() {
                _.each(manifest, function(tex) {
                    var data = {
                        images: [queue.getResult(tex.id)]
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