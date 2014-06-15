define([
	'classy',
    'underscore',
    'signals',
    'easel',
    'sound',
    'collision',
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

function(Class, _, signals, easeljs, soundjs, collider, ResourceManager, DefaultObjects, KeyCoder, Editor, UntilTimer, Messenger, Zombie, Chest, Door, Button, Bullet) {
    var Level = Class.$extend({
		__init__: function(stage, data, player, resourceManager, editorMode, sound) {
            this.data = data;

            this.keyCoder = new KeyCoder();
            this.keyCoder.addEventListener("keyup", KeyCoder.M, ResourceManager.toggleSound);

            this.editorMode = editorMode;

            if (this.editorMode)
                this.editor = new Editor(this, stage);

            this.showingMessagesCount = 0;

            this.stage = stage;

            this.background = null;
            this.effects = {
                fog: null,
                damageEffect: null
            };

            this.player = player;
            this.prevPlayerPos = {};
            this.resourceManager = resourceManager;


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

            this.camera = {
                x: 0,
                y: 0
            };

            this.reload(data);


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
            }
        },

        reload: function(data) {
            var self = this;
            this.data = data;

            //reset stage
            this.stage.removeAllChildren();
            this.stage.update();

            this.containers = []; //wall, chest, waypoint and so on

            //create main container for camera feature
            this.mainContainer = new createjs.Container();
            this.stage.addChild(this.mainContainer);

            if (this.editorMode)
                this.editor.setMainContainer(this.mainContainer); //setter in JS, oh wow, lol

            //add background
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
            this.player.currentWeapon = "knife";


            //add effects
            if (!this.editorMode) {
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
            }

            if (!this.editorMode) {
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

                Messenger.showMessage(this.data.name + " started...", Messenger.MessageColor.LevelLoaded, 6000);
            }

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
            this.fpsText.y = 100;

            this.updateEffects();
        },

        createContainer: function(name, toStage) {
            var container = new createjs.Container();
            this.containers[name] = container;

            if (toStage)
                this.stage.addChild(container);
            else
                this.mainContainer.addChild(container);
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

            //Порядок добавления важен
            for (var i = 0; i < this.chests.length; ++i) {
                this.collisionObjects.push(this.chests[i].dispObj);
            }
        },

        //objData requires to have {type, tex, x, y}
        addToStage: function(objData, doNotCenter, id) {
            if (objData instanceof createjs.DisplayObject)
                objData.type = objData.data.type;

            if (!_.isUndefined(id))
                alert("Do you really need id?");

            //TODO: fix undefined type issue
            if (_.isUndefined(objData.type)) {
                console.log(objData);
                alert("objData.type should be specified!");
            }

            var spriteSheet =
                this.resourceManager.getTiledSpriteSheet(objData.tex, objData.w, objData.h);

            var sprite = new easeljs.Sprite(spriteSheet);

            if (_.isUndefined(this.containers[objData.type])) {
                var container = new createjs.Container();
                this.containers[objData.type] = container;
                this.mainContainer.addChild(container);
            }
            var addTo = this.containers[objData.type];

            var dispObj = null;
            if (id)
                dispObj = addTo.addChildAt(sprite, id);
            else
                dispObj = addTo.addChild(sprite);

            dispObj.x = objData.x || objData.width/2 || 0;
            dispObj.y = objData.y || objData.height/2 || 0;
            dispObj.rotation = objData.r || objData.rotation || 0;
            if (!doNotCenter) {
                dispObj.regX = dispObj.getBounds().width / 2;
                dispObj.regY = dispObj.getBounds().height / 2;
            }
            dispObj.data = objData;

            if (this.editorMode)
                this.editor.setObjectHandlers(dispObj);

            return dispObj;
        },

        removeFromStage: function(dispObj) {
            var container = this.containers[dispObj.data.type];
            container.removeChild(dispObj);
        },

        onJoystickMessage: function(data, answer) {
            var self = this;

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
                        var speedModifier = (data.r === 0) ? (null) : (data.r === 1) ? (Level.SpeedModifier.Normal) : (Level.SpeedModifier.Sprint);
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
                        this.chestsOpeningHandle(self, event);
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
            if (!this.editorMode) {
                if (this.finished)
                    return;

                this.keyFunc(event);
                this.setPrevPlayerPos();

                this.player.update(event, this.collisionObjects);

                for (var i = 0; i < this.zombies.length; ++i) {
                    this.zombies[i].update(event, this.player, this.collisionObjects);
                    if (this.zombies[i].justFired === "pistol") {
                        this.zombies[i].justFired = "";
                        ResourceManager.playSound(ResourceManager.soundList.PistolFire);
                        var bulletData = {
                            x: this.zombies[i].dispObj.x,
                            y: this.zombies[i].dispObj.y,
                            r: this.zombies[i].dispObj.rotation,
                            power: ResourceManager.weaponData.pistol.power,
                            source: "zombie",
                            tex: "pistol-bullet",
                            type: "bullet"
                        };

                        var bullet = new Bullet(
                            this.addToStage(bulletData),
                            bulletData);

                        this.bullets.push(bullet);
                    }
                }
                for (var i = 0; i < this.bullets.length; ++i) {
                    this.bullets[i].update(event);
                }

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

                this.healthText.text = "Health: " + this.player.health;

                var currentWeapon = this.player.currentWeapon;
                var ammo = this.player.weapons[currentWeapon];

                var weaponText = currentWeapon;
                if (weaponText != "knife")
                    weaponText += ": " + ammo;
                this.weaponText.text = weaponText;

                this.fpsText.text = "FPS: " + Math.round(easeljs.Ticker.getMeasuredFPS());

                this.scoreText.text = "Score: " + this.player.score;

                this.updateFog();

                for (var sound in ResourceManager.playingSounds) {
                    if (ResourceManager.playingSounds[sound] > 0) {
                        --ResourceManager.playingSounds[sound];
                    }
                }

                this.updateCamera();
            }
            else {
                this.editor.keyFunc(event);
            }
		},

        updateCamera: function() {
            var stageSize = {
                width: this.stage.canvas.width,
                height: this.stage.canvas.height
            };
            var offset = 200;

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

        keyFunc: function(event) {
            var self = this;

            if (this.checkBounds(this.player.dispObj)) {
                this.player.dispObj.x = this.prevPlayerPos.x;
                this.player.dispObj.y = this.prevPlayerPos.y;
                this.player.dispObj.rotation = this.prevPlayerPos.rotation;
            }

            this.weaponsHandle(event);
            if (event.keys[KeyCoder.SPACE]) {
                this.shootingHandle();
            }

            this.bulletsCollisionsHandle();
            this.zombiesDeathHandle(self);
            this.dropsHandle();

            this.buttonsPressingHandle(event);
            if (event.keys[KeyCoder.E]) {
                this.chestsOpeningHandle(self, event);
                this.doorsOpeningHandle(event);
            }
        },

        weaponsHandle: function(event) {
            if(this.player.cooldown == 0) {
                if(event.keys[KeyCoder.ONE]) {
                    if ("knife" in this.player.weapons) {
                        this.player.currentWeapon = "knife";

                        if (this.player.dispObj.tex != "player") {
                            this.player.dispObj.tex = "player";
                            this.removeFromStage(this.player.dispObj);
                            this.player.setDispObj(this.addToStage(this.player.dispObj));
                        }
                        ResourceManager.playSound(ResourceManager.soundList.KnifeDraw, ResourceManager.weaponData.drawCooldown);
                        this.player.cooldown = ResourceManager.weaponData.drawCooldown;
                    }
                }
                if(event.keys[KeyCoder.TWO]) {
                    if ("pistol" in this.player.weapons) {
                        this.player.currentWeapon = "pistol";

                        if (this.player.dispObj.tex != "player-pistol") {
                            this.player.dispObj.tex = "player-pistol";
                            this.removeFromStage(this.player.dispObj);
                            this.player.setDispObj(this.addToStage(this.player.dispObj));
                        }

                        ResourceManager.playSound(ResourceManager.soundList.PistolDraw, ResourceManager.weaponData.drawCooldown);
                        this.player.cooldown = ResourceManager.weaponData.drawCooldown;
                    }
                }
                if(event.keys[KeyCoder.THREE]) {
                    if ("shotgun" in this.player.weapons) {
                        this.player.currentWeapon = "shotgun";

                        if (this.player.dispObj.tex != "player-shotgun") {
                            this.player.dispObj.tex = "player-shotgun";
                            this.removeFromStage(this.player.dispObj);
                            this.player.setDispObj(this.addToStage(this.player.dispObj));
                        }

                        ResourceManager.playSound(ResourceManager.soundList.ShotgunDraw, ResourceManager.weaponData.drawCooldown);
                        this.player.cooldown = ResourceManager.weaponData.drawCooldown;
                    }
                }

            }
        },

        shootingHandle: function() {
            if(this.player.cooldown == 0) {
                var currentWeapon = this.player.currentWeapon;
                if (this.player.weapons[currentWeapon] > 0) {
                    if (currentWeapon === "knife") {
                        var hit = false;
                        for (var i = 0; i < this.zombies.length; ++i) {
                            var xToZombie = this.player.dispObj.x - this.zombies[i].dispObj.x;
                            var yToZombie = this.player.dispObj.y - this.zombies[i].dispObj.y;
                            var distanceToZombie = Math.sqrt(xToZombie * xToZombie + yToZombie * yToZombie);

                            if (distanceToZombie <= this.player.reach) {
                                this.zombies[i].health -= ResourceManager.weaponData.knife.power;
                                hit = true;
                            }
                        }
                        ResourceManager.playSound((hit) ? (ResourceManager.soundList.KnifeHit) : (ResourceManager.soundList.KnifeMissShort));

                        this.player.cooldown = ResourceManager.weaponData.knife.coolDown;
                    }
                    else if (currentWeapon === "pistol") {
                        ResourceManager.playSound(ResourceManager.soundList.PistolFire);
                        var bulletData = {
                            x: this.player.dispObj.x,
                            y: this.player.dispObj.y,
                            r: this.player.dispObj.rotation,
                            power: ResourceManager.weaponData.pistol.power,
                            source: "player",
                            tex: "pistol-bullet",
                            type: "bullet"
                        };

                        var bullet = new Bullet(
                            this.addToStage(bulletData),
                            bulletData);

                        this.bullets.push(bullet);

                        this.player.cooldown = ResourceManager.weaponData.pistol.coolDown;
                        --this.player.weapons['pistol'];
                    }
                    else if (currentWeapon === "shotgun") {
                        ResourceManager.playSound(ResourceManager.soundList.ShotgunFire);
                        for (var i = 0; i < ResourceManager.weaponData.shotgun.bulletNum; ++i) {

                            var bulletData = {
                                x: this.player.dispObj.x,
                                y: this.player.dispObj.y,
                                r: this.player.dispObj.rotation - (Math.floor(ResourceManager.weaponData.shotgun.bulletNum/2) - i) * ResourceManager.weaponData.shotgun.dispersion,
                                power: ResourceManager.weaponData.shotgun.power,
                                source: "player",
                                tex: "shotgun-bullet",
                                ttl: 8,
                                type: "bullet"
                            };
                            var bullet = new Bullet(this.addToStage(bulletData), bulletData);

                            this.bullets.push(bullet);
                        }

                        this.player.cooldown = ResourceManager.weaponData.shotgun.coolDown;
                        --this.player.weapons['shotgun'];
                    }
                }
                else {
                    Messenger.showMessage("You are out of ammo!", Messenger.MessageColor.NoAmmo);
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

        zombiesDeathHandle: function(self) {
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
                    this.player.score += Level.SCORES.KILL;
                }
            }
        },

        chestsOpeningHandle: function(self, event) {
            for (var i = 0; i < this.chests.length; ++i) {
                if (this.checkReach(this.chests[i])) {
                    this.chests[i].update(event, this.player);

                    if (this.chests[i].justTried == true) {
                        this.chests[i].justTried = false;
                        Messenger.showMessage(this.chests[i].requiresMessage.toString(), Messenger.MessageColor.DoorClosed);
                        break;
                    }
                    else if (this.chests[i].justOpened == true) {

                        ResourceManager.playSound(ResourceManager.soundList.ChestOpen);
                        this.chests[i].justOpened = false;
                        this.chests[i].storage.forEach(function(drop) {

                            switch (drop['type']) {
                                case "weapon":
                                    var name = drop['name'];
                                    var ammo = drop['ammo'] || 5;
                                    if (name in self.player.weapons) {
                                        self.player.weapons[name] += ammo;
                                        Messenger.showMessage("You picked up " + ammo + " ammo for " + name, Messenger.MessageColor.Ammo);
                                    }
                                    else {
                                        self.player.weapons[name] = ammo;
                                        Messenger.showMessage("You picked up a new weapon: " + name, Messenger.MessageColor.NewWeapon);
                                    }
                                    break;
                                case "medkit":
                                    self.player.heal(drop['size']);
                                    break;
                                case "ammo":
                                    if (drop['name'] in self.player.weapons) {
                                        self.player.weapons[drop['name']] += drop['size'];
                                        Messenger.showMessage("You picked up " + drop['size'] + " ammo for " + drop['name'], Messenger.MessageColor.Ammo);
                                    }
                                    break;
                                case "key":
                                    if (!(drop['name'] in self.player.keys)) {
                                        self.player.keys.push(drop['name']);
                                        Messenger.showMessage("You got a " + drop['name'], Messenger.MessageColor.NewItem);
                                    }
                                    break;
                                default:
                                    if (drop['name']) {
                                        self.player.inventory.push(drop['name']);
                                    }
                            }
                        });

                        this.chests[i].storage = [];
                        this.removeFromStage(this.chests[i].dispObj);
                        this.addToStage(this.chests[i]);
                        break;
                    }
                }
            }
        },


        dropsHandle: function() {
            for (var i = 0; i < this.drops.length; ++i) {
                if (this.checkReach(this.drops[i])) {
                    if (collider.checkPixelCollision(this.drops[i], this.player.dispObj)) {
                        switch (this.drops[i].data['type']) {
                            case "key":
                                if (!(this.drops[i].data['name'] in this.player.keys)) {
                                    this.player.keys.push(this.drops[i].data['name']);
                                    Messenger.showMessage("You picked up a " + this.drops[i].data['name'], Messenger.MessageColor.NewItem);
                                }
                                break;
                            case "weapon":
                                ResourceManager.playSound(ResourceManager.soundList.Ammo);
                                var name = this.drops[i].data['name'];
                                if (name in this.player.weapons) {
                                    this.player.weapons[name] += this.drops[i].data['ammo'];
                                    Messenger.showMessage("You picked up " + this.drops[i].data['ammo'] + " ammo for " + this.drops[i].data['name'], Messenger.MessageColor.Ammo);
                                }
                                else {
                                    this.player.weapons[name] = this.drops[i].data['ammo'];
                                    Messenger.showMessage("You picked up a new weapon: " + this.drops[i].data['name'], Messenger.MessageColor.NewWeapon);
                                }
                                break;
                            case "medkit":
                                var howMuch = this.drops[i].data['size'];
                                this.player.heal(howMuch);
                                break;
                            default:
                                if (this.drops[i].data['name']) {
                                    this.player.inventory.push(this.drops[i].data['name']);
                                    Messenger.showMessage(this.drops[i].data['name'] + " added to your inventory!");
                                }
                        }

                        this.removeFromStage(this.drops[i]);
                        this.drops.splice(i, 1);
                    }
                }
            }
        },

        doorsOpeningHandle: function(event) {
            for (var i = 0; i < this.doors.length; ++i) {
                this.doors[i].update(event, this.player, this.zombies.length);
                if (this.doors[i].justTried == true) {
                    this.doors[i].justTried = false;
                    Messenger.showMessage(this.doors[i].requiresMessage.toString(), Messenger.MessageColor.DoorClosed);
                }
                else if (this.doors[i].justOpened == true) {
                    ResourceManager.playSound(ResourceManager.soundList.DoorOpen);

                    this.doors[i].justOpened = false;
                    for (var j = 0; j < this.collisionObjects.length; ++j) {
                        if (this.collisionObjects[j] == this.doors[i].dispObj) {
                            this.collisionObjects.splice(j, 1);
                        }
                    }
                    this.removeFromStage(this.doors[i].dispObj);
                    this.addToStage(this.doors[i]);

                    this.player.score += Level.SCORES.DOOR_OPEN;

                    if (this.doors[i].role === "exit") {
                        this.finish();
                    }
                }
            }
        },

        buttonsPressingHandle: function(event) {
            for (var i = 0; i < this.buttons.length; ++i) {
                this.buttons[i].update(event, this.player, this.doors);
                if (this.buttons[i].justPressed === true) {
                    ResourceManager.playSound(ResourceManager.soundList.Click);
                    this.buttons[i].justPressed = false;
                    this.removeFromStage(this.buttons[i].dispObj);
                    this.buttons[i].setDispObj(this.addToStage(this.buttons[i]));
                }
                else if (this.buttons[i].justDepressed === true) {
                    this.buttons[i].justDepressed = false;
                    this.removeFromStage(this.buttons[i].dispObj);
                    this.buttons[i].setDispObj(this.addToStage(this.buttons[i]));
                }
                if (this.buttons[i].message) {
                    Messenger.showMessage(this.buttons[i].message, Messenger.MessageColor.Default);
                    this.buttons[i].message = "";
                }
            }
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
                Messenger.showMessage("Level finished!", Messenger.MessageColor.LevelFinished, finishTimeout);

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

	return Level;
});