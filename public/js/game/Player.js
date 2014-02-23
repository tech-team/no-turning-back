define([
	'classy'
],
function(Class) {
	var Player = Class.$extend({
		__init__ : function() {
            this.x = 0;
            this.y = 0;
            this.angle = 0;

			this.score = 0;

            this.sprite = new Image();
            this.sprite.src = "res/gfx/objects/player.png";
		},

		update: function() {

		},

		render: function(context) {
            context.drawImage(this.sprite, this.x, this.y);
		}
	});

	return Player;
});