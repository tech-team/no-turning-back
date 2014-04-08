define([
	'classy',
    'underscore',
    'easel',
    'preload',
    'game/ImageTiler'
],
function(Class, _, createjs, preloadjs, ImageTiler) {
	var ResourceManager = Class.$extend({
        __classvars__: {
            texList: ["ground", "zombie", "player", "wall", "brick_wall1", "brick_wall2",
                "brick_wall3", "brick_wall4", "chest", "door-open", "door-closed", "rubbish",
                "waypoint", "pistol-bullet", "effects/fog", "effects/damage", "zombie_corpse"]
        },

		__init__: function(onComplete, onCompleteContext) {
            this.images = [];
            this.spriteSheets = [];
            this.sounds = [];

            var self = this;

            var queue = new preloadjs.LoadQueue();
            queue.on("complete", handleComplete, this);

            var manifest = [];
            _.each(ResourceManager.texList, function(tex) {
                manifest.push({
                    id: tex,
                    src: tex + ".png"
                });
            });

            queue.loadManifest(manifest, true, "res/gfx/");

            function handleComplete() {
                _.each(manifest, function(tex) {
                    self.images[tex.id] = queue.getResult(tex.id);
                });
                onComplete.call(onCompleteContext);
            }
		},

        getSpriteSheet: function(tex) {
            var spriteSheet = this.spriteSheets[tex];

            if (!spriteSheet) { //if not cached
                var image = this.images[tex];

                var data = {
                    images: [image],
                    frames: {
                        width: image.width,
                        height: image.height
                    }
                };

                this.spriteSheets[tex] = spriteSheet = new createjs.SpriteSheet(data);
            }

            return spriteSheet;
        },

        getTiledSpriteSheet: function(tex, desiredWidth, desiredHeight) {
            var image = this.images[tex];

            //if desired sizes specified differs from actual image's size
            if (desiredWidth && desiredHeight
                && desiredWidth != "" && desiredHeight != "" //default editor values
                && (image.width != desiredWidth || image.height != desiredHeight)) {
                var tiledImage =
                    ImageTiler(image,
                        desiredWidth/image.width,
                        desiredHeight/image.height);

                var data = {
                    images: [tiledImage],
                    frames: {
                        width: desiredWidth,
                        height: desiredHeight
                    }
                };

                return new createjs.SpriteSheet(data);
            }
            else
                return this.getSpriteSheet(tex);
        }
	});

	return ResourceManager;
});