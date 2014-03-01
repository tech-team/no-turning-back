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
            //TODO: repeat texture to fill entire (levelData.width, levelData.height)
            var background = new easeljs.Sprite(resourceManager.getTexture(levelData.tex));
            stage.addChild(background);

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

        addToStage: function(levelObj) {
            var spriteSheet = this.resourceManager.getTexture(levelObj.tex);
            var sprite = new easeljs.Sprite(spriteSheet);
            var dispObj =  this.stage.addChild(sprite);

            dispObj.x = levelObj.x || 0;
            dispObj.y = levelObj.y || 0;
            dispObj.angle = levelObj.angle || 0;

            return dispObj;
        },

		update: function(event) {
			
		}
	});

	return Level;
});