define([
	'classy',
    'underscore',
    'signals',
    'easel',
    'sound',
    'alertify',
    'collision',
    'game/StageManager',
    'game/ResourceManager',
    'game/DefaultObjects',
    'game/misc/KeyCoder',
    'game/Editor',
    'game/misc/UntilTimer',
    'game/misc/Messenger',
    'game/entities/Zombie',
    'game/entities/Chest',
    'game/entities/Door',
    'game/entities/Button',
    'game/entities/Bullet'
],
function(Class, _, signals, easeljs, soundjs, alertify, collider, StageManager, ResourceManager, DefaultObjects, KeyCoder, Editor, UntilTimer, Messenger, Zombie, Chest, Door, Button, Bullet) {
    var GameLevel = StageManager.$extend({
		__init__: function(stage, data, player, resourceManager, sound) {
            this.$super(stage, resourceManager);
            this.data = data;

            this.keyCoder = new KeyCoder();
            this.keyCoder.addEventListener("keyup", KeyCoder.M, ResourceManager.toggleSound.bind(ResourceManager));

            this.showingMessagesCount = 0;

            this.background = null;
            this.effects = {
                fog: null,
                damageEffect: null
            };

            this.player = player;
            this.prevPlayerPos = {};

            //TODO: all of these objects' dispObjects can be obtained via this.containers["name"].children btw
            this.walls = [];
            this.doors = [];
            this.chests = [];
            this.buttons = [];
            this.zombies = [];
            this.bullets = [];

            this.collisionObjects = [];
            this.drops = [];

            this.isJoystick = false;
            this.joystickServer = null;
            this.lastShootTime = 0;
            this.shootDelta = 350;
            this.finished = false;

            this.load(data);

            // Events
            this.levelFinished = new signals.Signal();
            this.keyCoder.addEventListener("keyup", KeyCoder.X, this.finish.bind(this));
		},

        __classvars__: {
            SCORES: {
                KILL: 10,
                DOOR_OPEN: 5
            },

            SpeedModifier: {
                Normal: 0.75,
                Sprint: 1.5
            },

            CameraOffset: 200
        },

        load: function(data) {
            this.$super(data);

            var self = this;
            this.data = data;

            //add background
            //NB: unused variable, left for better code understandability
            this.background = this.addToStage(data, true);

            //add walls
            _.each(data.walls, function(obj) {
                self.walls.push(self.addToStage(obj));
            });

            //create empty containers for future stuff
            this.createContainer("corpse");
            this.createContainer("medkit");
            this.createContainer("weapon");
            this.createContainer("key");
            this.createContainer("bullet");

            //add doors
            _.each(data.doors, function(obj) {
                var door = new Door(obj);
                door.setDispObj(self.addToStage(obj));
                self.doors.push(door);
            });

            //add chests
            _.each(data.chests, function(obj) {
                var chest = new Chest(obj);
                chest.setDispObj(self.addToStage(obj));
                self.chests.push(chest);
            });

            //add buttons
            _.each(data.buttons, function(obj) {
                var button = new Button(obj);
                button.setDispObj(self.addToStage(obj));
                self.buttons.push(button);
            });

            //add enemies
            _.each(data.zombies, function(obj) {
                var zombie = new Zombie(obj);
                zombie.setDispObj(self.addToStage(obj));
                self.zombies.push(zombie);
            });

            //add waypoints
            for (var i = 0; i < self.zombies.length; ++i) {
                _.each(self.zombies[i].waypoints, function(obj) {
                    self.addToStage(obj).visible = false;
                });
            }

            //add player
            var playerObj = this.addToStage(data.player);
            this.player.setDispObj(playerObj);
            this.prevPlayerPos = {
                x: this.player.dispObj.x,
                y: this.player.dispObj.y,
                rotation: this.player.dispObj.rotation
            };

            //add effects
            this.createContainer("effect", true);

            var graphics = new easeljs.Graphics();
            this.effects.fogBox = new easeljs.Shape(graphics);

            var fogBox = this.containers["effect"].addChild(this.effects.fogBox);

            this.effects.fog = this.addToStage({
                type: "effect",
                tex: "effects/fog",
                x: this.player.dispObj.x,
                y: this.player.dispObj.y});

            this.effects.damage = this.addToStage({
                type: "effect",
                tex: "effects/damage",
                x: 0, y: 0,
                w: this.stage.canvas.width,
                h: this.stage.canvas.height}, true);
            this.effects.damage.visible = false;

            var healthText = new easeljs.Text("Health: 100", "20px Arial", "#00FF00");
            healthText.shadow = new easeljs.Shadow("#000000", 5, 5, 10);
            this.healthText = this.stage.addChild(healthText);

            var weaponText = new easeljs.Text("Ammo: 0", "20px Arial", "#00FF00");
            weaponText.shadow = new easeljs.Shadow("#000000", 5, 5, 10);
            this.weaponText = this.stage.addChild(weaponText);

            var scoreText = new easeljs.Text("Score: 0", "20px Arial", "#00FF00");
            scoreText.shadow = new easeljs.Shadow("#000000", 5, 5, 10);
            this.scoreText = this.stage.addChild(scoreText);

            var fpsText = new easeljs.Text("FPS: 0", "20px Arial", "#00FF00");
            fpsText.shadow = new easeljs.Shadow("#000000", 5, 5, 10);
            this.fpsText = this.stage.addChild(fpsText);

            this.resize(); //recalculate overlay positions

            Messenger.showMessage(Messenger.levelLoaded, this.data.name);
            Messenger.showMessage(Messenger.levelStarted);

            this.updateFog(true);
            this.player.setEffects(this.effects);

            this.createCollisionObjects();
            soundjs.Sound.stop();
        },

        resize: function() {
            var toolbarHeight = this.stage.canvas.height - 32;

            this.healthText.x = 20;
            this.healthText.y = toolbarHeight;

            this.weaponText.x = this.stage.canvas.width / 2;
            this.weaponText.y = toolbarHeight;

            this.scoreText.x = this.stage.canvas.width - 100;
            this.scoreText.y = toolbarHeight;

            this.fpsText.x = this.stage.canvas.width - 90;
            this.fpsText.y = 80;

            this.updateEffects();

            //reset camera position
            this.mainContainer.x = 0;
            this.mainContainer.y = 0;
            this.updateCamera();
        },

        createCollisionObjects: function() {
            for (var i = 0; i < this.walls.length; ++i) {
                this.collisionObjects.push(this.walls[i]);
            }

            for (var i = 0; i < this.zombies.length; ++i) {
                this.collisionObjects.push(this.zombies[i].dispObj);
            }
            for (var i = 0; i < this.doors.length; ++i) {
                if (this.doors[i].state === "closed") {
                    this.collisionObjects.push(this.doors[i].dispObj);
                }
            }

            //Порядок добавления важен. Или не очень.
            for (var i = 0; i < this.chests.length; ++i) {
                this.collisionObjects.push(this.chests[i].dispObj);
            }
        },

        onJoystickMessage: function(data, answer) {
            if (this.finished)
                return;

            if (data.type === "game") {
                switch (data.action) {
                    case "shoot":
                        if ('timestamp' in data && (this.lastShootTime === 0 || data.timestamp - this.lastShootTime > this.shootDelta)) {
                            this.lastShootTime = data.timestamp;

                            this.shootingHandle();
                        }
                        break;
                    case "weaponchange":
                        var weapon = data.weapon;
                        console.log(weapon);
                        var event = (new KeyCoder()).getKeys();
                        switch (weapon) {
                            case "knife":
                                event.keys[KeyCoder.ONE] = true;
                                break;
                            case "pistol":
                                event.keys[KeyCoder.TWO] = true;
                                break;
                            case "shotgun":
                                event.keys[KeyCoder.THREE] = true;
                                break;
                        }
                        this.weaponsHandle(event);
                        break;
                    case "move":
                        var speedModifier = (data.r === 0) ? (null) : (data.r === 1) ? (GameLevel.SpeedModifier.Normal) : (GameLevel.SpeedModifier.Sprint);
                        if (speedModifier) {
                            var movementData = {
                                speedModifier: speedModifier,
                                angle: data.phi
                            };
                            this.player.movementHandle(movementData, this.collisionObjects);
                        }
                        break;
                    case "use":
                        var event = (new KeyCoder()).getKeys();
                        event.keys[KeyCoder.E] = true;
                        this.chestsOpeningHandle(event);
                        this.buttonsPressingHandle(event);
                        this.doorsOpeningHandle(event);
                        event.keys[KeyCoder.E] = false;
                        break;
                    default:
                        break;
                }
            }
        },

		update: function(event) {
            if (this.finished)
                return;
            
            var self = this;

            if (this.checkBounds(this.player.dispObj)) {
                this.player.dispObj.x = this.prevPlayerPos.x;
                this.player.dispObj.y = this.prevPlayerPos.y;
                this.player.dispObj.rotation = this.prevPlayerPos.rotation;
            }
            this.setPrevPlayerPos();

            this.weaponsHandle(event);
            if (event.keys[KeyCoder.SPACE]) {
                this.shootingHandle();
            }

            this.bulletsCollisionsHandle();
            this.zombiesDeathHandle();
            this.dropsHandle();

            this.buttonsPressingHandle(event);
            if (event.keys[KeyCoder.E]) {
                this.chestsOpeningHandle(event);
                this.doorsOpeningHandle(event);
            }

            this.player.update(event, this.collisionObjects);

            this.zombiesUpdate(event);


            _.each(this.bullets, function(bullet) {
                bullet.update(event);
            });

            if (this.player.health <= 0 && !this.player.dead) {
                this.player.dead = true;
                console.log("Game over.");
                ResourceManager.playSound(ResourceManager.soundList.GameOver);
                this.levelFinished.dispatch({
                    status: 'gameFinished',
                    score: this.player.score,
                    message: "Game over"
                });
            }

            this.hudSetup();

            this.updateFog();

            for (var sound in ResourceManager.playingSounds) {
                if (ResourceManager.playingSounds[sound] > 0) {
                    --ResourceManager.playingSounds[sound];
                }
            }

            this.updateCamera();
		},

        updateCamera: function() {
            var stageSize = {
                width: this.stage.canvas.width,
                height: this.stage.canvas.height
            };
            var offset = GameLevel.CameraOffset;

            if (this.player.dispObj.x > stageSize.width - offset) {
                this.mainContainer.x = -(this.player.dispObj.x - (stageSize.width - offset));
            }
            else if (this.player.dispObj.x < offset) {
                this.mainContainer.x = -this.player.dispObj.x + offset;
            }

            if (this.player.dispObj.y > stageSize.height - offset) {
                this.mainContainer.y = -(this.player.dispObj.y - (stageSize.height - offset));
            }
            else if (this.player.dispObj.y < offset) {
                this.mainContainer.y = -this.player.dispObj.y + offset;
            }
        },

        hudSetup: function() {
            this.healthText.text = "Health: " + Math.ceil(this.player.health);

            var currentWeapon = this.player.currentWeapon;
            var ammo = this.player.weapons[currentWeapon].ammo;

            var weaponText = currentWeapon;
            if (weaponText != "knife")
                weaponText += ": " + ammo;
            this.weaponText.text = weaponText;

            this.fpsText.text = "FPS: " + Math.round(easeljs.Ticker.getMeasuredFPS());

            this.scoreText.text = "Score: " + this.player.score;
        },

        zombiesUpdate: function(event) {
            var self = this;

            _.each(this.zombies, function(zombie) {
                zombie.update(event, self.player, self.collisionObjects);
                if (zombie.justFired === "pistol") {
                    zombie.justFired = "";
                    ResourceManager.playSound(ResourceManager.soundList.pistol.Fire);
                    var bulletData = {
                        x: zombie.dispObj.x,
                        y: zombie.dispObj.y,
                        r: zombie.dispObj.rotation,
                        power: ResourceManager.weaponData.pistol.power,
                        source: "zombie",
                        tex: "pistol-bullet",
                        type: "bullet"
                    };

                    var bullet = new Bullet(
                        self.addToStage(bulletData),
                        bulletData);

                    self.bullets.push(bullet);
                }
            });
        },

        weaponsHandle: function(event) {
            var weapon = null;
            if(event.keys[KeyCoder.ONE]) {
                weapon = "knife";
            }
            if(event.keys[KeyCoder.TWO]) {
                weapon = "pistol";
            }
            if(event.keys[KeyCoder.THREE]) {
                weapon = "shotgun";
            }

            if (weapon != null) {
                if (this.player.hasWeapon(weapon) && this.player.currentWeapon != weapon) {
                    this.player.currentWeapon = weapon;
                    this.player.dispObj.tex = "player-{0}".format(this.player.currentWeapon);
                    this.removeFromStage(this.player.dispObj);
                    this.player.setDispObj(this.addToStage(this.player.dispObj));

                    ResourceManager.playSound(ResourceManager.soundList[this.player.currentWeapon].Draw, ResourceManager.weaponData.drawCooldown);
                    this.player.shootCooldown = ResourceManager.weaponData.drawCooldown;
                }
            }
        },

        shootingHandle: function() {
            if(this.player.shootCooldown == 0) {
                var currentWeapon = this.player.currentWeapon;

                if (this.player.hasCurrentAmmo()) {
                    var currentWeaponSounds = ResourceManager.soundList[currentWeapon];

                    if (this.player.isCurrentWeaponMelee()) {
                        var hit = this.player.shoot(this);
                        ResourceManager.playSound((hit) ? (currentWeaponSounds.Hit) : (currentWeaponSounds.MissShort));
                    }
                    else {
                        ResourceManager.playSound(currentWeaponSounds.Fire);
                        this.player.shoot(this);
                    }
                }
                else if (this.player.messageCooldown <= 0) {
                    Messenger.showMessage(Messenger.outOfAmmo);
                    this.player.messageCooldown = 100;
                }
            }
        },

        bulletsCollisionsHandle: function() {
            out:
            for (var i = 0; i < this.bullets.length; ++i) {
                if (this.bullets[i].ttl){
                    if (--this.bullets[i].ttl <= 0) {
                        this.removeFromStage(this.bullets[i].dispObj);
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
                if (this.bullets[i].source != "player" && collider.checkPixelCollision(this.bullets[i].dispObj, this.player.dispObj)) {
                    this.player.damage(this.bullets[i].power);
                    this.removeFromStage(this.bullets[i].dispObj);
                    ResourceManager.playSound(ResourceManager.soundList.BulletHit);
                    ResourceManager.playSound(ResourceManager.soundList.PlayerHurt);
                    this.bullets.splice(i, 1);
                    break;
                }
                for(var j = 0; j < this.zombies.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.zombies[j].dispObj)) {
                        this.zombies[j].health -= this.bullets[i].power;
                        this.removeFromStage(this.bullets[i].dispObj);
                        ResourceManager.playSound(ResourceManager.soundList.BulletHit);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
                for(var j = 0; j < this.collisionObjects.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.collisionObjects[j])) {
                        this.removeFromStage(this.bullets[i].dispObj);
                        ResourceManager.playSound(ResourceManager.soundList.BulletRicochet);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
                if (this.checkBounds(this.bullets[i].dispObj)) {
                    this.removeFromStage(this.bullets[i].dispObj);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        },

        zombiesDeathHandle: function() {
            var self = this;

            for (var i = 0; i < this.zombies.length; ++i) {
                if (this.zombies[i].health <= 0) {
                    var corpse = DefaultObjects.build("corpse",
                        {
                            tex: "zombie_corpse",
                            x: this.zombies[i].dispObj.x,
                            y: this.zombies[i].dispObj.y,
                            r: this.zombies[i].dispObj.rotation
                        });

                    this.addToStage(corpse);
                    this.removeFromStage(this.zombies[i].dispObj);

                    for (var j = 0; j < this.collisionObjects.length; ++j) {
                        if (this.collisionObjects[j] == this.zombies[i].dispObj) {
                            this.collisionObjects.splice(j, 1);
                        }
                    }

                    this.zombies[i].drops.forEach(function(dropped) {
                        dropped.x = self.zombies[i].dispObj.x;
                        dropped.y = self.zombies[i].dispObj.y;

                        var drop = DefaultObjects.build(dropped.type, dropped);
                        self.drops.push(self.addToStage(drop))
                    });

                    this.zombies.splice(i, 1);
                    this.player.score += GameLevel.SCORES.KILL;
                }
            }
        },

        itemInteraction: function(item, playSounds) {
            switch (item['type']) {
                case "weapon":
                    var name = item['name'];
                    var ammo = item['ammo'] || 5;
                    if (this.player.hasWeapon(name)) {
                        this.player.addAmmo(name, ammo);
                        Messenger.showMessage(Messenger.ammoPicked, ammo, name);
                    }
                    else {
                        this.player.addWeapon(name, ammo);
                        Messenger.showMessage(Messenger.newWeaponPicked, name);
                    }
                    if (playSounds)
                        ResourceManager.playSound(ResourceManager.soundList.Ammo);
                    break;
                case "medkit":
                    this.player.heal(item['size']);
                    break;
                case "ammo":
                    if (this.player.hasWeapon(item['name'])) {
                        this.player.addAmmo(item['name'], item['size']);
                        Messenger.showMessage(Messenger.ammoPicked, item['size'], item['name']);
                    }
                    break;
                case "key":
                    if (!(item['name'] in self.player.keys)) {
                        this.player.keys.push(item['name']);
                        Messenger.showMessage(Messenger.keyPicked, item['name']);
                    }
                    break;
                default:
                    if (item['name']) {
                        this.player.inventory.push(drop['name']);
                        Messenger.showMessage(Messenger.newItemPicked, drop['name']);
                    }
            }
        },

        chestsOpeningHandle: function(event) {
            var self = this;

            _.each(this.chests, function(chest) {
                if (self.checkReach(chest)) {
                    chest.update(event, self.player);

                    if (chest.justTried == true) {
                        chest.justTried = false;
                        Messenger.showMessage(Messenger.chestLocked, chest.requiresMessage);
                        return false;
                    }
                    else if (chest.justOpened == true) {
                        ResourceManager.playSound(ResourceManager.soundList.ChestOpen);
                        chest.justOpened = false;

                        _.each(chest.storage, self.itemInteraction.bind(self));

                        chest.storage = [];
                        self.collisionObjects.remove(chest.dispObj);
                        self.removeFromStage(chest.dispObj);
                        var dispObj = self.addToStage(chest);
                        self.collisionObjects.push(dispObj);

                        return false; //break
                    }
                }
            });
        },


        dropsHandle: function() {
            for (var i = 0; i < this.drops.length; ++i) {
                //can't use _.each here because of splice in the end, but
                var drop = this.drops[i]; //caching and readability!

                //TODO: looks like a copy of chest handling -_-
                //TODO: refactoring required?

                if (this.checkReach(drop)) {
                    if (collider.checkPixelCollision(drop, this.player.dispObj)) {
                        this.itemInteraction(drop.data, true);

                        this.removeFromStage(drop);
                        this.drops.splice(i, 1);
                    }
                }
            }
        },

        doorsOpeningHandle: function(event) {
            var self = this;
            
            _.each(this.doors, function(door) {
                door.update(event, self.player, self.zombies.length);
                if (door.justTried == true) {
                    door.justTried = false;
                    Messenger.showMessage(door.requiresMessage);
                }
                else if (door.justOpened == true) {
                    ResourceManager.playSound(ResourceManager.soundList.DoorOpen);

                    door.justOpened = false;
                    for (var j = 0; j < self.collisionObjects.length; ++j) {
                        if (self.collisionObjects[j] == door.dispObj) {
                            self.collisionObjects.splice(j, 1);
                        }
                    }
                    self.removeFromStage(door.dispObj);
                    self.addToStage(door);

                    self.player.score += GameLevel.SCORES.DOOR_OPEN;

                    if (door.role === "exit") {
                        self.finish();
                    }

                    return false; //do not open all the doors at once
                }
            });
        },

        buttonsPressingHandle: function(event) {
            var self = this;

            //TODO: надо развязать проверку нажатия и проверку отпускания кнопки
            //TODO: так как нажиматься должна только 1 кнопка за раз, а обновление вообще должно происходить для всех
            //TODO: можно попробовать повесить отпукание в UntilTimer или setTimeout
            _.each(this.buttons, function(button) {
                button.update(event, self.player, self.doors);

                if (button.justPressed === true) {
                    ResourceManager.playSound(ResourceManager.soundList.Click);
                    button.justPressed = false;
                    self.removeFromStage(button.dispObj);
                    button.setDispObj(self.addToStage(button));
                }
                else if (button.justDepressed === true) {
                    button.justDepressed = false;
                    self.removeFromStage(button.dispObj);
                    button.setDispObj(self.addToStage(button));
                }
                if (button.message) {
                    Messenger.showMessage(button.message);
                    button.message = undefined;
                }
            });
        },

        checkReach: function(obj) {
            var xToObject = this.player.dispObj.x - obj.x;
            var yToObject = this.player.dispObj.y - obj.y;

            return (Math.sqrt(xToObject*xToObject + yToObject*yToObject) <= this.player.reach);
        },

        checkBounds: function(obj) {
            return (
            obj.x + obj.getBounds().width/2 >= this.data['w'] ||
            obj.x - obj.getBounds().width/2 <= 0 ||
            obj.y + obj.getBounds().width/2 >= this.data['h'] ||
            obj.y - obj.getBounds().width/2 <= 0
            );
        },

        setPrevPlayerPos: function() {
            this.prevPlayerPos = {
                x: this.player.dispObj.x,
                y: this.player.dispObj.y,
                rotation: this.player.dispObj.rotation
            };
        },

        updateEffects: function() {
            this.updateFog(true);

            this.removeFromStage(this.effects.damage);
            this.effects.damage = this.addToStage({
                type: "effect",
                tex: "effects/damage",
                x: 0, y: 0,
                w: this.stage.canvas.width,
                h: this.stage.canvas.height}, true);
            this.effects.damage.visible = false;
        },

        updateFog: function(forceUpdate) {
            if (this.effects.fog) {
                var playerPos = {
                    x: Math.floor(this.player.dispObj.x + this.mainContainer.x),
                    y: Math.floor(this.player.dispObj.y + this.mainContainer.y)
                };

                //if player moved
                if (this.effects.fog.x != playerPos.x
                    || this.effects.fog.y != playerPos.y
                    || forceUpdate) {

                    var fogBox = this.effects.fogBox.graphics;

                    var frameSize = 380;
                    var stageSize = {
                        width: this.stage.canvas.width,
                        height: this.stage.canvas.height
                    };

                    fogBox.clear();
                    fogBox.beginFill("#000");

                    fogBox.rect(
                        0,
                        0,
                        stageSize.width,
                        playerPos.y - frameSize/2
                    ); //top

                    fogBox.rect(
                        0,
                        0,
                        playerPos.x - frameSize/2,
                        stageSize.height
                    ); //left

                    fogBox.rect(
                        0,
                        playerPos.y + frameSize/2,
                        stageSize.width,
                        stageSize.height - playerPos.y - frameSize/2
                    ); //bottom

                    fogBox.rect(
                        playerPos.x + frameSize/2,
                        0,
                        stageSize.width - playerPos.x + frameSize/2,
                        stageSize.height
                    ); //right

                    this.effects.fog.x = playerPos.x;
                    this.effects.fog.y = playerPos.y;
                }
            }
        },

        finish: function() {
            if (!this.finished) {
                this.finished = true;
                var finishTimeout = 7000;

                ResourceManager.playSound(ResourceManager.soundList.LevelFinished);
                Messenger.showMessage(Messenger.levelFinished);

                var self = this;
                new UntilTimer(finishTimeout, function() {
                        self.stage.alpha = 1 - this.elapsed / finishTimeout;
                    },
                    function() {
                        self.levelFinished.dispatch({});
                        self.stage.alpha = 1;
                    });
            }
        }
	});

	return GameLevel;
});