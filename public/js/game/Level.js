define([
	'classy',
    'underscore',
    'easel'
],
function(Class, _, easeljs) {
	var Level = Class.$extend({
		__init__: function(stage, levelInfo, resourceManager) {

            _.each(levelInfo.walls, function(wall) {
                var tex = resourceManager.getTexture(wall.tex);
                stage.addChild(new easeljs.Sprite(tex));
            });
		},

		update: function(event) {
			
		}
	});

	return Level;
});