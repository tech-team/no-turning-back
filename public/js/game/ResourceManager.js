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
            texList: ["ground", "zombie", "player", "player-pistol", "player-shotgun", "wall", "brick_wall1", "brick_wall2",
                "brick_wall3", "brick_wall4", "chest", "chest-open", "door-open", "door-closed", "door-exit", "rubbish",
                "waypoint", "pistol", "pistol-bullet", "shotgun", "shotgun-bullet", "golden-key", "silver-key",
                "effects/fog", "effects/damage", "zombie_corpse", "golden_apple"],
            soundList: {
                Ammo: "ammo.mp3",
                Medkit: "apple.mp3",
                KnifeDraw: "knife.mp3",
                KnifeMiss: "knife_miss.mp3",
                KnifeMissShort: "knife_miss_short.mp3",
                KnifeHit: "knife_stab.mp3",
                PistolDraw: "pistol_draw.mp3",
                PistolFire: "pistol_shoot.mp3",
                ShotgunDraw: "shotgun_draw.mp3",
                ShotgunFire: "shotgun_shoot.mp3",
                BulletHit: "bullet_hit.mp3",
                ZombieHurt: "ambiance.mp3",
                PlayerHurt: ["hurt1.mp3", "hurt2.mp3", "hurt3.mp3"],
                BulletRicochet: "ricochet.mp3",
                DoorOpen: "door_open.mp3",
                ChestOpen: "chest_open.mp3",
                GameOver: "game_over.mp3",
                Victory: "fortunate_son.mp3",
                CheaterVictory: "cheater_victory.mp3"
            },
            weaponData: {
                knife: {
                    power: 5,
                    coolDown: 40
                },
                pistol: {
                    power: 10,
                    coolDown: 30
                },
                shotgun: {
                    power: 20,
                    coolDown: 60,
                    bulletNum: 5,
                    dispersion: 10,
                    ttl: 8
                },
                drawCooldown: 25
            },
            playingSounds: {},

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

            playSound: function(sound, cooldown) {
                if (this.soundDisabled)
                    return;

                if (_.isArray(sound)) {
                    var randId = _.random(0, sound.length - 1);
                    soundjs.Sound.play(sound[randId]);
                }
                else {
                    if (!(sound in ResourceManager.playingSounds) || (ResourceManager.playingSounds[sound] === 0)) {
                        soundjs.Sound.play(sound);
                        ResourceManager.playingSounds[sound] = cooldown || 0;
                    }
                }
            }
        },

		__init__: function(onComplete, onCompleteContext) {
            this.images = [];
            this.spriteSheets = [];

            var self = this;

            var $progressBarDiv = $('.game-load-progress');
            var $progressBar = $('.game-load-progress__wrapper__progress');
            var $progressBarLabel = $('.game-load-progress__wrapper__progress-value');

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
                    //TODO: should separate sounds and textures
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