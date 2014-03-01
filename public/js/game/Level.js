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

            var self = this;

            //add background
            var backgroundSh = resourceManager.getTiledSpriteSheet(levelData.tex, levelData.width, levelData.height);
            var backgroundSprite = new easeljs.Sprite(backgroundSh);
            stage.addChild(backgroundSprite);

            //add walls
            _.each(levelData.walls, function(wall) {
                self.walls.push(self.addToStage(wall));
            });

            //add doors

            //add chests


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