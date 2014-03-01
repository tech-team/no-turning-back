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
                    self.textures[tex.id] = queue.getResult(tex.id);
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