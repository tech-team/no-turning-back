define([
	'classy',
	'game/GameObject'
],
function(Class, GameObject) {
	var AliveObject = GameObject.$extend({
		__init__: function() {
			this.health = 20;
		},

		update: function(event) {
			
		}
	});

	return AliveObject;
});