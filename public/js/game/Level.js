define([
	'classy',
    'underscore',
    'easel',
    'sound',
    'collision',
    'game/ResourceManager',
    'game/DefaultObjects',
    'game/KeyCoder',
    'game/Editor',
    'game/UntilTimer',
    'game/Zombie',
    'game/Chest',
    'game/Door',
    'game/Bullet'
],

function(Class, _, easeljs, soundjs, collider, ResourceManager, DefaultObjects, KeyCoder, Editor, UntilTimer, Zombie, Chest, Door, Bullet) {
    var Level = Class.$extend({
		__init__: function(stage, data, player, resourceManager, editorMode, sound) {
            this.data = data;

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
            this.zombies = [];
            this.bullets = [];
            this.collisionObjects = [];
            this.drops = [];

            this.isJoystick = false;
            this.joystickServer = null;
            this.lastShootTime = 0;
            this.shootDelta = 350;

            this.reload(data);
		},

        __classvars__: {
            SCORES: {
                KILL: 10,
                DOOR_OPEN: 5
            },

            MessageColor: {
                Default: "#00FF00",
                NewWeapon: "#0BB389",
                NewItem: "#A1BF26",
                Medkit: "#1397F0",
                Ammo: "#A7FA16",
                DoorClosed: "#0FFFF0",
                NoAmmo: "#459DBA"
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

            //add background
            this.background = this.addToStage(data, true);
            this.backgroundId = this.stage.getChildIndex(this.background);


            //add walls
            _.each(data.walls, function(obj) {
                self.walls.push(self.addToStage(obj));
            });

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
            if (!this.editorMode) {
                var graphics = new easeljs.Graphics();
                this.effects.fogBox = new easeljs.Shape(graphics);
                var fogBox = this.stage.addChild(this.effects.fogBox);
                this.fogId = this.stage.getChildIndex(fogBox);

                this.effects.fog = this.addToStage({
                    tex: "effects/fog",
                    x: this.player.dispObj.x,
                    y: this.player.dispObj.y});

                this.effects.damage = this.addToStage({
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

                this.resize(); //recalculate overlay positions
            }

            this.updateFog(true);
            this.player.setEffects(this.effects);

            this.createCollisionObjects();
        },

        resize: function() {
            var toolbarHeight = this.stage.canvas.height - 32;

            this.healthText.x = 20;
            this.healthText.y = toolbarHeight;

            this.weaponText.x = this.stage.canvas.width / 2;
            this.weaponText.y = toolbarHeight;

            this.scoreText.x = this.stage.canvas.width - 100;
            this.scoreText.y = toolbarHeight;

            this.updateEffects();
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

        addToStage: function(objData, doNotCenter, id) {
            var spriteSheet =
                this.resourceManager.getTiledSpriteSheet(objData.tex, objData.w, objData.h);

            var sprite = new easeljs.Sprite(spriteSheet);
            var objToAdd = sprite;

            if (this.editorMode) {
                var container = new createjs.Container();
                container.addChild(sprite);
                objToAdd = container;
            }
            var dispObj = null;
            if (id)
                dispObj = this.stage.addChildAt(objToAdd, id);
            else
                dispObj = this.stage.addChild(objToAdd);

            dispObj.x = objData.x || objData.width/2 || 0;
            dispObj.y = objData.y || objData.height/2 || 0;
            dispObj.rotation = objData.r || objData.rotation || 0;
            if (!doNotCenter) {
                dispObj.regX = dispObj.getBounds().width / 2;
                dispObj.regY = dispObj.getBounds().height / 2;
            }
            dispObj.data = objData;

            if (this.editorMode)
                this.editor.setContainerHandlers(dispObj);

            return dispObj;
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
                this.keyFunc(event);
                this.setPrevPlayerPos();

                this.player.update();
                if (this.zombies.length === 0) {
                    ResourceManager.playSound(ResourceManager.soundList.Victory);
                    $.event.trigger({
                        type: "levelFinished",
                        score: this.player.score,
                        message: "You Win"
                    });
                }

                for (var i = 0; i < this.zombies.length; ++i) {
                    this.zombies[i].update(event, this.player, this.collisionObjects);
                }
                for (var i = 0; i < this.bullets.length; ++i) {
                    this.bullets[i].update(event);
                }


                if (this.player.health <= 0 && !this.player.dead) {
                    this.player.dead = true;
                    console.log("Game over.");
                    ResourceManager.playSound(ResourceManager.soundList.GameOver);
                    $.event.trigger({
                        type: "levelFinished",
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

                this.scoreText.text = "Score: " + this.player.score;

                this.updateFog();
            }
            else {
                this.editor.keyFunc(event);
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

            if (event.keys[KeyCoder.E]) {
                this.chestsOpeningHandle(self, event);
                this.doorsOpeningHandle(event);
            }

            if (event.keys[KeyCoder.M]) {
                ResourceManager.toggleSound();
            }
        },

        weaponsHandle: function(event) {
            if(event.keys[KeyCoder.ONE]) {
                if ("knife" in this.player.weapons) {
                    this.player.currentWeapon = "knife";

                    if (this.player.dispObj.tex != "player") {
                        this.player.dispObj.tex = "player";
                        this.stage.removeChild(this.player.dispObj);
                        this.player.setDispObj(this.addToStage(this.player.dispObj, false, this.fogId));
                    }
                    ResourceManager.playSound(ResourceManager.soundList.KnifeDraw);
                }
            }
            if(event.keys[KeyCoder.TWO]) {
                if ("pistol" in this.player.weapons) {
                    this.player.currentWeapon = "pistol";

                    if (this.player.dispObj.tex != "player-pistol") {
                        this.player.dispObj.tex = "player-pistol";
                        this.stage.removeChild(this.player.dispObj);
                        this.player.setDispObj(this.addToStage(this.player.dispObj, false, this.fogId));
                    }

                    ResourceManager.playSound(ResourceManager.soundList.PistolDraw);
                }
            }
            if(event.keys[KeyCoder.THREE]) {
                if ("shotgun" in this.player.weapons) {
                    this.player.currentWeapon = "shotgun";

                    if (this.player.dispObj.tex != "player-shotgun") {
                        this.player.dispObj.tex = "player-shotgun";
                        this.stage.removeChild(this.player.dispObj);
                        this.player.setDispObj(this.addToStage(this.player.dispObj, false, this.fogId));
                    }

                    ResourceManager.playSound(ResourceManager.soundList.ShotgunDraw);
                }
            }
        },

        shootingHandle: function() {
            if(this.player.cooldown == 0) {
                var currentWeapon = this.player.currentWeapon;
                if (this.player.weapons[currentWeapon] > 0) {
                    if (currentWeapon === "knife") {
                        for (var i = 0; i < this.zombies.length; ++i) {
                            var xToZombie = this.player.dispObj.x - this.zombies[i].dispObj.x;
                            var yToZombie = this.player.dispObj.y - this.zombies[i].dispObj.y;
                            var distanceToZombie = Math.sqrt(xToZombie * xToZombie + yToZombie * yToZombie);

                            if (distanceToZombie <= this.player.reach) {
                                this.zombies[i].health -= ResourceManager.weaponData.knife.power;
                                ResourceManager.playSound(ResourceManager.soundList.KnifeHit);
                            }
                            else if (distanceToZombie <= this.player.reach) {
                                ResourceManager.playSound(ResourceManager.soundList.KnifeMiss);
                            }
                        }
                        this.player.cooldown = ResourceManager.weaponData.knife.coolDown;
                    }
                    else if (currentWeapon === "pistol") {
                        ResourceManager.playSound(ResourceManager.soundList.PistolFire);
                        var bulletData = {
                            x: this.player.dispObj.x,
                            y: this.player.dispObj.y,
                            r: this.player.dispObj.rotation,
                            power: ResourceManager.weaponData.pistol.power,
                            tex: "pistol-bullet"
                        };

                        var bullet = new Bullet(
                            this.addToStage(bulletData, false, this.backgroundId+1),
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
                                tex: "shotgun-bullet",
                                ttl: 8
                            };
                            var bullet = new Bullet(this.addToStage(bulletData, false, this.backgroundId+1), bulletData);

                            this.bullets.push(bullet);
                        }

                        this.player.cooldown = ResourceManager.weaponData.shotgun.coolDown;
                        --this.player.weapons['shotgun'];
                    }
                }
                else {
                    this.showMessage("You are out of ammo!", Level.MessageColor.NoAmmo);
                }
            }
        },
        bulletsCollisionsHandle: function() {
            out:
            for (var i = 0; i < this.bullets.length; ++i) {
                if (this.bullets[i].ttl){
                    if (--this.bullets[i].ttl <= 0) {
                        this.stage.removeChild(this.bullets[i].dispObj);
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
                for(var j = 0; j < this.zombies.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.zombies[j].dispObj)) {
                        this.zombies[j].health -= this.bullets[i].power;
                        this.stage.removeChild(this.bullets[i].dispObj);
                        ResourceManager.playSound(ResourceManager.soundList.BulletHit);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
                for(var j = 0; j < this.collisionObjects.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.collisionObjects[j])) {
                        this.stage.removeChild(this.bullets[i].dispObj);
                        ResourceManager.playSound(ResourceManager.soundList.BulletRicochet);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
                if (this.checkBounds(this.bullets[i].dispObj)) {
                    this.stage.removeChild(this.bullets[i].dispObj);
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

                    this.addToStage(corpse, false, this.backgroundId+1);
                    this.stage.removeChild(this.zombies[i].dispObj);

                    for (var j = 0; j < this.collisionObjects.length; ++j) {
                        if (this.collisionObjects[j] == this.zombies[i].dispObj) {
                            this.collisionObjects.splice(j, 1);
                        }
                    }

                    this.zombies[i].drops.forEach(function(dropped) {
                        dropped.x = self.zombies[i].dispObj.x;
                        dropped.y = self.zombies[i].dispObj.y;

                        var drop = DefaultObjects.build(dropped.type, dropped);
                        self.drops.push(self.addToStage(drop, false, self.backgroundId+2))
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
                        this.showMessage(this.chests[i].requiresMessage.toString(), Level.MessageColor.DoorClosed);
                        break;
                    }
                    else if (this.chests[i].justOpened == true) {
                        ResourceManager.playSound(ResourceManager.soundList.ChestOpen);
                        this.chests[i].justOpened = false;
                        this.chests[i].storage.forEach(function(drop) {

                            switch (drop['type']) {
                                case "weapon":
                                    var name = drop['name'];
                                    if (name in self.player.weapons) {
                                        self.player.weapons[name] += drop['ammo'];
                                        self.showMessage("You picked up " + drop['ammo'] + " ammo for " + drop['name'], Level.MessageColor.Ammo);
                                    }
                                    else {
                                        self.player.weapons[name] = drop['ammo'];
                                        self.showMessage("You picked up a new weapon: " + drop['name'], Level.MessageColor.NewWeapon);
                                    }
                                    break;
                                case "medkit":
                                    self.player.health += drop['size'];
                                    if (self.player.health > self.player.maxHealth)
                                        self.player.health = self.player.maxHealth;

                                    self.showMessage("You healed " + drop['size'] + " health", Level.MessageColor.Medkit);
                                    break;
                                case "ammo":
                                    if (drop['name'] in self.player.weapons) {
                                        self.player.weapons[drop['name']] += drop['size'];
                                        self.showMessage("You picked up " + drop['size'] + " ammo for " + drop['name'], Level.MessageColor.Ammo);
                                    }
                                    break;
                                case "key":
                                    if (!(drop['name'] in self.player.keys)) {
                                        self.player.keys.push(drop['name']);
                                        self.showMessage("You got a " + drop['name'], Level.MessageColor.NewItem);
                                    }
                                    break;
                                default:
                                    if (drop['name']) {
                                        self.player.inventory.push(drop['name']);
                                    }
                            }
                        });

                        this.chests[i].storage = [];
                        this.stage.removeChild(this.chests[i].dispObj);
                        this.addToStage(this.chests[i], false, this.backgroundId+1);
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
                                    this.showMessage("You picked up a " + this.drops[i].data['name'], Level.MessageColor.NewItem);
                                }
                                break;
                            case "weapon":
                                var name = this.drops[i].data['name'];
                                if (name in this.player.weapons) {
                                    this.player.weapons[name] += this.drops[i].data['ammo'];
                                    this.showMessage("You picked up " + this.drops[i].data['ammo'] + " ammo for " + this.drops[i].data['name'], Level.MessageColor.Ammo);
                                }
                                else {
                                    this.player.weapons[name] = this.drops[i].data['ammo'];
                                    this.showMessage("You picked up a new weapon: " + this.drops[i].data['name'], Level.MessageColor.NewWeapon);
                                }
                                break;
                            default:
                                if (this.drops[i].data['name']) {
                                    this.player.inventory.push(this.drops[i].data['name']);
                                    this.showMessage(this.drops[i].data['name'] + " added to your inventory!");
                                }
                        }

                        this.stage.removeChild(this.drops[i]);
                        this.drops.splice(i, 1);
                    }
                }
            }
        },

        doorsOpeningHandle: function(event) {
            for (var i = 0; i < this.doors.length; ++i) {
                if (this.checkReach(this.doors[i])) {
                    this.doors[i].update(event, this.player);
                    if (this.doors[i].justTried == true) {
                        this.doors[i].justTried = false;
                        this.showMessage(this.doors[i].requiresMessage.toString(), Level.MessageColor.DoorClosed);
                    }
                    else if (this.doors[i].justOpened == true) {
                        ResourceManager.playSound(ResourceManager.soundList.DoorOpen);

                        this.doors[i].justOpened = false;
                        for (var j = 0; j < this.collisionObjects.length; ++j) {
                            if (this.collisionObjects[j] == this.doors[i].dispObj) {
                                this.collisionObjects.splice(j, 1);
                            }
                        }
                        this.stage.removeChild(this.doors[i].dispObj);
                        this.addToStage(this.doors[i], false, this.backgroundId+1);

                        this.player.score += Level.SCORES.DOOR_OPEN;
                    }
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

            this.stage.removeChild(this.effects.damage);
            this.effects.damage = this.addToStage({
                tex: "effects/damage",
                x: 0, y: 0,
                w: this.stage.canvas.width,
                h: this.stage.canvas.height}, true);
            this.effects.damage.visible = false;
        },

        updateFog: function(forceUpdate) {
            if (this.effects.fog) {
                //if player moved
                if (this.effects.fog.x != this.player.dispObj.x
                    || this.effects.fog.y != this.player.dispObj.y
                    || forceUpdate) {

                    var fogBox = this.effects.fogBox.graphics;
                    var playerPos = {
                        x: this.player.dispObj.x,
                        y: this.player.dispObj.y
                    };
                    var frameSize = 370;
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

                    this.effects.fog.x = this.player.dispObj.x;
                    this.effects.fog.y = this.player.dispObj.y;
                }
            }
        },

        showMessage: function(message, color, period) {
            this.showingMessagesCount++;

            var text = new easeljs.Text(message, "20px Arial", color || Level.MessageColor.Default);
            text.x = this.stage.canvas.width / 2 - text.getMeasuredWidth() / 2;
            text.y = text.getMeasuredHeight() * this.showingMessagesCount;
            text.shadow = new easeljs.Shadow("#000000", 5, 5, 10);

            var dispObjText = this.stage.addChild(text);

            var self = this;
            period = period || 3000;

            new UntilTimer(period,
                function() {
                    text.alpha = (period - this.elapsed)/period;
                },
                function() {
                    self.stage.removeChild(dispObjText);
                    self.showingMessagesCount--;
                }
            );
        }
	});

	return Level;
});