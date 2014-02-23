define([
	'classy'
],
function(Class) {
	var GameObject = Class.$extend({
		__init__ : function(spriteUrl) {
            this.x = 0;
            this.y = 0;
            this.angle = 0;

            this.sprite = new Image();
            this.sprite.src = spriteUrl;
		},

        load: function(data) {
            this.x = data.x;
            this.y = data.y;
            this.angle = data.angle;
        },

		update: function() {

		},

		render: function(context) {
            context.drawImage(this.sprite, this.x, this.y);
		}
	});

	return GameObject;
});