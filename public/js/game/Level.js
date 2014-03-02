define([
	'classy',
    'underscore',
    'easel'
],
function(Class, _, easeljs) {
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
            player.setDispObj(this.addToStage(levelData.player));
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
            dispObj.angle = objData.angle || 0;

            return dispObj;
        },

		update: function(event) {
			
		}
	});

	return Level;
});