define([
	'classy',
    'underscore',
    'easel',
    'collision',
    'game/KeyCoder'
],
function(Class, _, easeljs, collider, KeyCoder) {
	var Level = Class.$extend({
		__init__: function(stage, levelData, player, resourceManager, editorMode) {
            this.editorMode = true;
            this.stage = stage;
            this.player = player;
            this.selectedObject = null;
            this.resourceManager = resourceManager;
            this.walls = [];
            this.doors = [];
            this.chests = [];

            this.data = levelData;
            this.selectionFilter = new easeljs.ColorFilter(1, 1, 1, 1, 10, 60, 10, 100);

            this.reload(levelData);
		},

        reload: function(levelData) {
            var self = this;
            this.levelData = levelData;

            //reset stage
            this.stage.removeAllChildren();
            this.stage.update();

            //add background
            var backgroundSh = this.resourceManager.getTiledSpriteSheet(levelData.tex, levelData.width, levelData.height);
            var backgroundSprite = new easeljs.Sprite(backgroundSh);
            this.background = this.stage.addChild(backgroundSprite);

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

        addToStage: function(objData) {
            var self = this;

            var spriteSheet =
                this.resourceManager.getTiledSpriteSheet(objData.tex, objData.width || 32, objData.height || 32);

            var sprite = new easeljs.Sprite(spriteSheet);
            var objToAdd = sprite;

            if (this.editorMode) {
                var container = new createjs.Container();
                container.addChild(sprite);
                objToAdd = container;
            }

            var dispObj = this.stage.addChild(objToAdd);
            dispObj.x = objData.x || 0;
            dispObj.y = objData.y || 0;
            dispObj.rotation = objData.r || 0;
            dispObj.regX = dispObj.getBounds().width / 2;
            dispObj.regY = dispObj.getBounds().height / 2;
            dispObj.data = objData;

            if (this.editorMode) {
                container.on("pressmove", function(evt) {
                    self.selectObject(evt.currentTarget);

                    evt.currentTarget.x = evt.stageX;
                    evt.currentTarget.y = evt.stageY;

                    self.stage.update();
                });

                container.on("click", function(evt) {
                    self.selectObject(evt.currentTarget);
                });

                container.on("dblclick",function(evt) {
                    console.log(evt.currentTarget.data);
                });
            }

            return dispObj;
        },

		update: function(event) {
            if (!this.editorMode) {
                this.keyFunc(event);
                this.player.update(event);
            }
            else
                this.editorKeyFunc(event);
		},

        keyFunc: function(event) {
            var offsetX, offsetY;
            var offsetRotation = 4;
            var speedModifier = 2;

            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.player.dispObj.rotation);
                this.player.dispObj.x += offsetX;
                this.player.dispObj.y += offsetY;
                for (var i = 0; i < this.walls.length; ++i) {
                    if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                        this.player.dispObj.x -= offsetX;
                        this.player.dispObj.y -= offsetY;
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation -= offsetRotation;
                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation += offsetRotation;
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
                        this.player.dispObj.x += offsetX;
                        this.player.dispObj.y += offsetY;
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation += offsetRotation;
                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (this.player.dispObj, this.walls[i])) {
                            this.player.dispObj.rotation -= offsetRotation;
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
        },

        //TODO: maybe move it to the separate class?
        editorKeyFunc: function(event) {
            if (this.selectedObject == null)
                return;

            if (event.keys[KeyCoder.A]) {
                this.selectedObject.x--;
            }

            if (event.keys[KeyCoder.D]) {
                this.selectedObject.x++;
            }

            if (event.keys[KeyCoder.W]) {
                this.selectedObject.y--;
            }

            if (event.keys[KeyCoder.S]) {
                this.selectedObject.y++;
            }

            if (event.keys[KeyCoder.Q]) {
                this.selectedObject.rotation--;
            }

            if (event.keys[KeyCoder.E]) {
                this.selectedObject.rotation++;
            }
        },
        
        applyFilters: function(dispObj, filters) {
            dispObj.filters = filters;

            dispObj.cache(0, 0,
                dispObj.getBounds().width,
                dispObj.getBounds().height);
            dispObj.updateCache();
        },

        selectObject: function(dispObj) {
            //reset filters
            if (this.selectedObject) {
                this.applyFilters(this.selectedObject, null);
            }

            //select object
            this.selectedObject = dispObj;
            this.applyFilters(this.selectedObject, [this.selectionFilter]);
        }
	});

	return Level;
});