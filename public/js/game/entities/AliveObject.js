define([
	'classy',
	'game/entities/GameObject'
],
function(Class, GameObject) {
	var AliveObject = GameObject.$extend({
		__init__: function() {
		},

		update: function(event) {
			
		}
	});

	return AliveObject;
});