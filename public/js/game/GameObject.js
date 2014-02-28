define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__: function() {
			this.x = 0;
			this.y = 0;
			this.angle = 0;

		},

		update: function(event) {
			
		},

		loadData: function(data) {
			data = data || this.zeroData;
			this.x = data.x;
			this.y = data.y;
			this.angle = data.angle;
		},

		zeroData: {
			x: 0,
			y: 0,
			angle: 0
		}
	});

	return GameObject;
});