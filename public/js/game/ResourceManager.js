define([
	'classy',
    'underscore',
    'easel',
    'preload',
    'sound',
    'game/ImageTiler'
],
function(Class, _, createjs, preloadjs, soundjs, ImageTiler) {
	var ResourceManager = Class.$extend({
        __classvars__: {
            //all textures should have .png format
            texList: ["ground", "zombie", "player", "player-pistol", "wall", "brick_wall1", "brick_wall2",
                "brick_wall3", "brick_wall4", "chest", "chest-open", "door-open", "door-closed", "rubbish",
                "waypoint", "pistol", "pistol-bullet", "effects/fog", "effects/damage", "zombie_corpse",
                "golden-key", "silver-key"],
            soundList: {
                PistolDraw: "pistol_draw.mp3",
                PistolFire: "shoot.mp3",
                PistolHit: "bullet_hit.mp3",
                KnifeDraw: "knife.mp3",
                KnifeMiss: "knife_miss.mp3",
                KnifeHit: "knife_stab.mp3",
                ZombieHurt: "ambiance.mp3",
                PlayerHurt: ["hurt1.wav", "hurt2.wav", "hurt3.wav"],
                BulletRicochet: "ricochet.mp3",
                DoorOpen: "",
                ChestOpen: "",
                GameOver: "game_over.mp3",
                Victory: ""//"fortunate_son.mp3"
            },

            instance: null,

            load: function(onComplete, onCompleteContext) {
                if (this.instance)
                    onComplete.call(onCompleteContext);
                else
                    this.instance = new ResourceManager(onComplete, onCompleteContext);

                return this.instance;
            },

            soundDisabled: localStorage["soundDisabled"],

            toggleSound: function() {
                localStorage["soundDisabled"] = !this.soundDisabled;
                this.soundDisabled = !this.soundDisabled;
            },

            playSound: function(sound) {
                if (this.soundDisabled)
                    return;

                if (_.isArray(sound)) {
                    var randId = _.random(0, sound.length);
                    soundjs.Sound.play(sound[randId]);
                }
                else
                    soundjs.Sound.play(sound);
            }
        },

		__init__: function(onComplete, onCompleteContext) {
            this.images = [];
            this.spriteSheets = [];

            var self = this;

            var $progressBarDiv = $('.game-load-progress');
            var $progressBar = $('.progress');
            var $progressBarLabel = $('.progress-value');

            var queue = new preloadjs.LoadQueue();
            queue.installPlugin(soundjs.Sound);
            queue.on("complete", handleComplete, this);
            queue.on("progress", handleProgress, this);

            var manifest = [];
            _.each(ResourceManager.texList, function(tex) {
                manifest.push({
                    id: tex,
                    src: "gfx/" + tex + ".png"
                });
            });

            _.each(ResourceManager.soundList, function(sound) {
                if (sound && sound != "") {

                    if (_.isArray(sound)) {
                        _.each(sound, function(snd) {
                            manifest.push({
                                id: snd,
                                src: "sound/" + snd
                            });
                        });
                    }
                    else {
                        manifest.push({
                            id: sound,
                            src: "sound/" + sound
                        });
                    }
                }
            });

            queue.loadManifest(manifest, true, "res/");

            function handleComplete() {
                _.each(manifest, function(tex) {
                    self.images[tex.id] = queue.getResult(tex.id);
                });
                onComplete.call(onCompleteContext);

                //hide progressBar
                $progressBarDiv.hide();
                //show game canvas
                $('#game-field').show();
                $('#editor-field').show();
            }

            function handleProgress(event) {
                var val = Math.floor(event.progress*100);
                $progressBar.val(val);
                $progressBarLabel.text(val + '%');
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