define([
	'classy',
	'game/GameObject'
],
function(Class, GameObject) {
	var Player = GameObject.$extend({
		__init__ : function() {
            this.$super("res/gfx/objects/player.png");

            this.score = 0;
		},

        fromJSON: function(data) {
            this.$super(data);
        },

		update: function() {
			this.$super();
		},

		render: function(context) {
            context.save();

            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.translate(-this.x, -this.y);

            this.$super(context);


            context.restore();
		}
	});

	return Player;
});