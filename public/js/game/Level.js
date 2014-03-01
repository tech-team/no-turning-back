define([
	'classy',
    'underscore',
    'easel'
],
function(Class, _, easeljs) {
	var Level = Class.$extend({
		__init__: function(stage, levelData, resourceManager) {

            _.each(levelData.walls, function(wall) {
                var spriteSheet = resourceManager.getTexture(wall.tex);
                var sprite = new easeljs.Sprite(spriteSheet);
                stage.addChild(sprite);
            });
		},

		update: function(event) {
			
		}
	});

	return Level;
});