define([
	'classy',
	'game/entities/GameObject'
],
function(Class, GameObject) {
	var AliveObject = GameObject.$extend({
		__init__: function(dispObj) {
            this.$super(dispObj);

            this.prevPos = {
                x: null,
                y: null,
                rotation: null
            };
		},

        setDispObj: function(dispObj) {
            this.$super(dispObj);
            this.savePrevPos();
        },

        savePrevPos: function() {
            this.prevPos.x = this.x();
            this.prevPos.y = this.y();
            this.prevPos.rotation = this.rotation();
        },

        restorePrevPos: function() {
            this.dispObj.x = this.prevPos.x;
            this.dispObj.y = this.prevPos.y;
            this.dispObj.rotation = this.prevPos.rotation;
        },

		update: function(event) {
			
		}
	});

	return AliveObject;
});