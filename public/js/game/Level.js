define([
	'classy',
    'underscore',
    'easel',
    'collision',
    'game/DefaultObjects',
    'game/KeyCoder',
    'game/Editor',
    'game/Zombie',
    'game/Chest',
    'game/Door',
    'game/Bullet'
],

function(Class, _, easeljs, collider, DefaultObjects, KeyCoder, Editor, Zombie, Chest, Door, Bullet) {
	var Level = Class.$extend({
		__init__: function(stage, data, player, resourceManager, editorMode) {
            this.data = data;

            this.editorMode = editorMode;

            if (this.editorMode)
                this.editor = new Editor(this, stage);

            this.stage = stage;
            this.background = null;
            this.effects = {
                fog: null,
                damageEffect: null
            };

            this.player = player;
            this.resourceManager = resourceManager;

            this.walls = [];
            this.doors = [];
            this.chests = [];
            this.zombies = [];
            this.bullets = [];
            this.collisionObjects = [];

            this.reload(data);
		},

        reload: function(data) {
            var self = this;
            this.data = data;

            //reset stage
            this.stage.removeAllChildren();
            this.stage.update();

            //add background
            //var backgroundSh = this.resourceManager.getTiledSpriteSheet(data.tex, data.width, data.height);
            //var backgroundSprite = new easeljs.Sprite(backgroundSh);
            //this.stage.addChild(backgroundSprite);
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
                    w: this.stage.getBounds().width,
                    h: this.stage.getBounds().height}, true);
                this.effects.damage.visible = false;
            }

            if (!this.editorMode) {
                var healthText = new easeljs.Text("Health: 100", "20px Arial", "#00FF00");
                this.healthText = this.stage.addChild(healthText);

                var scoreText = new easeljs.Text("Score: 0", "20px Arial", "#00FF00");
                this.scoreText = this.stage.addChild(scoreText);

                this.resize(); //recalculate overlay positions
            }

            this.updateFog(true);
            this.player.setEffects(this.effects);

            this.createCollisionObjects();
        },

        resize: function() {
            this.healthText.x = 20;
            this.healthText.y = this.stage.canvas.height - 32;

            this.scoreText.x = this.stage.canvas.width - 100;
            this.scoreText.y = this.stage.canvas.height - 32;
        },

        createCollisionObjects: function() {
            for (var i = 0; i < this.walls.length; ++i) {
                this.collisionObjects.push(this.walls[i]);
            }

            for (var i = 0; i < this.doors.length; ++i) {
                if (this.doors[i].state === Door.State.Closed) {
                    this.collisionObjects.push(this.doors[i].dispObj);
                }
            }

            for (var i = 0; i < this.zombies.length; ++i) {
                this.collisionObjects.push(this.zombies[i].dispObj);
            }
        },

        addToStage: function(objData, doNotCenter, id) {
            var self = this;

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
            dispObj.rotation = objData.r || 0;
            if (!doNotCenter) {
                dispObj.regX = dispObj.getBounds().width / 2;
                dispObj.regY = dispObj.getBounds().height / 2;
            }
            dispObj.data = objData;

            if (this.editorMode)
                this.editor.setContainerHandlers(dispObj);

            return dispObj;
        },

		update: function(event) {
            if (!this.editorMode) {
                this.keyFunc(event);
                this.player.update(event);
                if (this.zombies.length === 0) {
                    $.event.trigger({
                        type: "levelFinished",
                        score: this.player.score
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
                    $.event.trigger({
                        type: "levelFinished",
                        score: this.player.score
                    });
                }

                this.healthText.text = "Health: " + this.player.health;
                this.scoreText.text = "Score: " + this.player.score;
                this.updateFog();
            }
            else
                this.editor.keyFunc(event);
		},

        keyFunc: function(event) {

            var offsetX, offsetY;
            var offsetRotation = 4;
            var speedModifier = 2;
            var reboundModifier = 1.1;

            var self = this;
            // if (event.keys[KeyCoder.E]) {
            //     $.event.trigger({
            //         type: "levelFinished",
            //         score: self.player.score
            //     });
            // }

            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.player.dispObj.rotation);
                this.player.dispObj.x += offsetX;
                this.player.dispObj.y += offsetY;
                for (var i = 0; i < this.collisionObjects.length; ++i) {
                    if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                        this.player.dispObj.x -= reboundModifier * offsetX;
                        this.player.dispObj.y -= reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.x += (reboundModifier - 1) * offsetX;
                            this.player.dispObj.y += (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation += reboundModifier * offsetRotation;

                        }
                    }
                }
            }
            if (event.keys[KeyCoder.S]) {
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.player.dispObj.rotation);
                this.player.dispObj.x -= offsetX;
                this.player.dispObj.y -= offsetY;
                for (var i = 0; i < this.collisionObjects.length; ++i) {
                    if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                        this.player.dispObj.x += reboundModifier * offsetX;
                        this.player.dispObj.y += reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.x -= (reboundModifier - 1) * offsetX;
                            this.player.dispObj.y -= (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation += reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
            }

            if (!(event.keys[KeyCoder.W] || event.keys[KeyCoder.S])) {
                if (event.keys[KeyCoder.D]) {
                    offsetRotation *= 2;
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation -= offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    offsetRotation *= 2;
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.collisionObjects[i])) {
                            this.player.dispObj.rotation += offsetRotation;

                        }
                    }
                }
            }

            if(event.keys[KeyCoder.SPACE] && this.player.cooldown == 0) {

                var bulletData = {
                    x: this.player.dispObj.x,
                    y: this.player.dispObj.y,
                    r: this.player.dispObj.rotation,
                    tex: "pistol-bullet"
                };

                //TODO: bullet types
                var bullet = new Bullet(
                    this.addToStage(bulletData, false, this.fogId),
                    bulletData);
                
                this.bullets.push(bullet);
                this.player.cooldown = 30;
            }

            out:
            for (var i = 0; i < this.bullets.length; ++i) {
                for(var j = 0; j < this.zombies.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.zombies[j].dispObj)) {
                        this.zombies[j].health -= this.bullets[i].power;
                        this.stage.removeChild(this.bullets[i].dispObj);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
                for(var j = 0; j < this.collisionObjects.length; ++j) {
                    if (collider.checkPixelCollision(this.bullets[i].dispObj,this.collisionObjects[j])) {
                        this.stage.removeChild(this.bullets[i].dispObj);
                        this.bullets.splice(i, 1);
                        break out;
                    }
                }
            }

            for (var i = 0; i < this.zombies.length; ++i) {
                if (this.zombies[i].health <= 0) {
                    //TODO: corpse
                    var corpse = DefaultObjects.build("corpse",
                    {
                        tex: "zombie_corpse",
                        x: this.zombies[i].dispObj.x,
                        y: this.zombies[i].dispObj.y,
                        r: this.zombies[i].dispObj.rotation
                    })

                    this.addToStage(corpse, false, this.backgroundId);
                    this.stage.removeChild(this.zombies[i].dispObj);
                    this.collisionObjects.splice(j, 1);
                    this.zombies.splice(i, 1);
                    this.player.score += 5;
                }
            }

            //TODO: move to player class
            if (this.player.cooldown > 0) {
                --this.player.cooldown;
            }
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
                    var stageSize = this.stage.getBounds();

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
                        playerPos.y - frameSize/2,
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
        }
	});

	return Level;
});