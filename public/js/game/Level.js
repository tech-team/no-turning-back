define([
	'classy',
    'underscore',
    'easel',
    'collision',
    'game/KeyCoder'
],
function(Class, _, easeljs, collider, KeyCoder) {
	var Level = Class.$extend({
		__init__: function(stage, levelData, player, resourceManager) {
            this.stage = stage;
            this.resourceManager = resourceManager;
            this.walls = [];
            this.doors = [];
            this.chests = [];

            var self = this;

            //add background
            var backgroundSh = resourceManager.getTiledSpriteSheet(levelData.tex, levelData.width, levelData.height);
            var backgroundSprite = new easeljs.Sprite(backgroundSh);
            stage.addChild(backgroundSprite);

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
            playerObj.regX = playerObj.getBounds().width / 2;
            playerObj.regY = playerObj.getBounds().height / 2;
            player.setDispObj(playerObj);
		},

        resizeTexture: function(tex, desiredWidth, desiredHeight) {

        },

        addToStage: function(objData) {
            var spriteSheet =
                this.resourceManager.getTiledSpriteSheet(objData.tex, objData.width || 32, objData.height || 32);

            var sprite = new easeljs.Sprite(spriteSheet);
            var dispObj =  this.stage.addChild(sprite);

            dispObj.x = objData.x || 0;
            dispObj.y = objData.y || 0;
            dispObj.angle = objData.angle || 0; // deprecated?

            return dispObj;
        },

		update: function(event, player) {

            var offsetX, offsetY;
            var offsetRotation = 4;
            var speedModifier = 2;

            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * player.dispObj.rotation);
                player.dispObj.x += offsetX;
                player.dispObj.y += offsetY;
                for (var i = 0; i < this.walls.length; ++i) {
                    if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                        player.dispObj.x -= offsetX;
                        player.dispObj.y -= offsetY;
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation -= offsetRotation;
                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation += offsetRotation;
                        }
                    }
                }
            }
            if (event.keys[KeyCoder.S]) {
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * player.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * player.dispObj.rotation);
                player.dispObj.x -= offsetX;
                player.dispObj.y -= offsetY;
                for (var i = 0; i < this.walls.length; ++i) {
                    if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                        player.dispObj.x += offsetX;
                        player.dispObj.y += offsetY;
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation += offsetRotation;
                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation -= offsetRotation;
                        }
                    }
                }
            }

            if (!(event.keys[KeyCoder.W] || event.keys[KeyCoder.S])) {
                if (event.keys[KeyCoder.D]) {
                    offsetRotation *= 2;
                    player.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation -= offsetRotation;
                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    offsetRotation *= 2;
                    player.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < this.walls.length; ++i) {
                        if (collider.checkPixelCollision (player.dispObj, this.walls[i])) {
                            player.dispObj.rotation += offsetRotation;
                        }
                    }
                }
            }


            player.update(event);

		}
	});

	return Level;
});