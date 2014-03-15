define([
	'classy',
    'underscore',
    'easel',
    'collision',
    'game/KeyCoder',
    'game/Editor'
],
function(Class, _, easeljs, collider, KeyCoder, Editor) {
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

            //TODO: doors and chests has some additional parameteres, should they be classes
            //TODO: or should we just add some fields to existing displayObjects?
            //add doors
            _.each(levelData.doors, function(obj) {
                self.doors.push(self.addToStage(obj));
            });

            //add chests
            _.each(levelData.chests, function(obj) {
                self.chests.push(self.addToStage(obj));
            });

            //add enemies

            //add player
            var playerObj = this.addToStage(levelData.player);
            this.player.setDispObj(playerObj);
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
            }
            else
                this.editor.keyFunc(event);
		},

        keyFunc: function(event) {
            var offsetX, offsetY;
            var offsetRotation = 4;
            var speedModifier = 2;
            var reboundModifier = 1.1;

            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.player.dispObj.rotation);
                this.player.dispObj.x += offsetX;
                this.player.dispObj.y += offsetY;
                for (var i = 0; i < this.walls.length; ++i) {
                    if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                        this.player.dispObj.x -= reboundModifier * offsetX;
                        this.player.dispObj.y -= reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.x += (reboundModifier - 1) * offsetX;
                            this.player.dispObj.y += (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
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
                for (var i = 0; i < this.walls.length; ++i) {
                    if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                        this.player.dispObj.x += reboundModifier * offsetX;
                        this.player.dispObj.y += reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.x -= (reboundModifier - 1) * offsetX;
                            this.player.dispObj.y -= (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation += reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
            }

            if (!(event.keys[KeyCoder.W] || event.keys[KeyCoder.S])) {
                if (event.keys[KeyCoder.D]) {
                    offsetRotation *= 2;
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation -= offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    offsetRotation *= 2;
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation += offsetRotation;

                        }
                    }
                }
            }

            if(event.keys[KeyCoder.SPACE] && this.player.cooldown == 0) {
                console.log("POW!");
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