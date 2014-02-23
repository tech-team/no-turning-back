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

        load: function(data) {
            this.$super(data);
        },

		update: function() {
			this.$super(data);
		},

		render: function(context) {
            this.$super(context);
		}
	});

	return Player;
});