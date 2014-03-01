define([
	'classy',
    'underscore',
    'easel'
],
function(Class, _, easeljs) {
	var Level = Class.$extend({
		__init__: function(stage, levelData, resourceManager) {
			
            _.each(levelData.walls, function(wall) {
                var sprite = new easeljs.Bitmap(resourceManager.getTexture(wall.tex));
                sprite.x = 100;
                sprite.y = 200;
                
                stage.addChild(sprite);
            });
		},

		update: function(event) {
			
		}
	});

	return Level;
});