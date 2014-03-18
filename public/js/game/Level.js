define([
	'classy',
    'underscore',
    'easel',
    'collision',
    'game/KeyCoder',
    'game/Editor',
    'game/Mob',
    'game/Chest',
    'game/Door',
    'game/Bullet'
],
function(Class, _, easeljs, collider, KeyCoder, Editor, Mob, Chest, Door, Bullet) {
	var Level = Class.$extend({
		__init__: function(stage, levelData, player, resourceManager, editorMode) {
            this.data = levelData;

            this.editorMode = editorMode;

            if (this.editorMode)
                this.editor = new Editor(this, stage);

            this.stage = stage;
            this.background = null;
            this.player = player;
            this.resourceManager = resourceManager;

            this.walls = [];
            this.doors = [];
            this.chests = [];
            this.mobs = [];
            this.bullets = [];
            this.collisionObjects = [];

            this.reload(levelData);
		},

        reload: function(levelData) {
            var self = this;
            this.levelData = levelData;

            //reset stage
            this.stage.removeAllChildren();
            this.stage.update();

            //add background
            //var backgroundSh = this.resourceManager.getTiledSpriteSheet(levelData.tex, levelData.width, levelData.height);
            //var backgroundSprite = new easeljs.Sprite(backgroundSh);
            //this.stage.addChild(backgroundSprite);
            this.background = this.addToStage(levelData, true);

            //add walls
            _.each(levelData.walls, function(obj) {
                self.walls.push(self.addToStage(obj));
            });

            //TODO: doors and chests have some additional parameteres, should they be classes
            //TODO: or should we just add some fields to existing displayObjects?
            //add doors
            _.each(levelData.doors, function(obj) {
                var door = new Door(obj);
                door.setDispObj(self.addToStage(obj));
                self.doors.push(door);
            });

            //add chests
            _.each(levelData.chests, function(obj) {
                var chest = new Chest(obj);
                chest.setDispObj(self.addToStage(obj));
                self.chests.push(chest);
            });


            //add enemies
            _.each(levelData.mobs, function(obj) {
                var mob = new Mob(obj);
                mob.setDispObj(self.addToStage(obj));
                self.mobs.push(mob);
            });

            //add waypoints
            for (var i = 0; i < self.mobs.length; ++i) {
                _.each(self.mobs[i].waypoints, function(obj) {
                    self.addToStage(obj);
                });
            }

            //add player
            var playerObj = this.addToStage(levelData.player);
            this.player.setDispObj(playerObj);

            this.createCollisionObjects();
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
                for (var i = 0; i < this.mobs.length; ++i) {
                    this.mobs[i].update(event, this.player);
                }
                for (var i = 0; i < this.bullets.length; ++i) {
                    this.bullets[i].update(event);
                }

                if (this.player.health <= 0) {
                    console.log("Game over.");
                    $.event.trigger({
                        type: "levelFinished",
                        score: this.player.score
                    });
                }
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
            if (event.keys[KeyCoder.E]) {
                $.event.trigger({
                    type: "levelFinished",
                    score: self.player.score
                });
            }

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
                console.log("POW!");
                var bullet = new Bullet("pistol", this.player);
                bullet.setDispObj(this.addToStage(bullet));
                this.bullets.push(bullet);
                //TODO: Valid addToStage for bullet
                //TODO: Bullet is flying, but dispObj isn't.
                this.player.cooldown = 30;
            }

            //TODO: move to player class
            if (this.player.cooldown > 0) {
                --this.player.cooldown;
            }

        }
	});

	return Level;
});