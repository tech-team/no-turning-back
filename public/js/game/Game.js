define([
	'classy',
	'easel'
],
function(Class, createjs) {
	var Game = Class.$extend({
		__init__: function(canvas) {
			this.FPS = 30;
			this.canvas = canvas;
			this.stage = new createjs.Stage(this.canvas);
			this.ticker = createjs.Ticker;
			//this.level = new Level();
		},

		run: function() {
			var self = this;
			this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			this.ticker.setFPS(this.FPS);
			this.ticker.on("tick", function(event) {
				self.update(event);
			});
			
			this.test();
		},

		circle: null,

		update: function(event) {

			this.circle.x += event.delta / 1000 * 100;
			

			this.stage.update(event);
		},

		test: function() {
			this.circle = new createjs.Shape();
			this.circle.graphics.beginFill("red").drawCircle(0, 0, 50);

			this.circle.x = 100;
			this.circle.y = 100;
			this.stage.addChild(this.circle);
		}
	});

	return Game;
});