define([
	'classy',
	'easel',
	'game/LevelManager'
],
function(Class, createjs, LevelManager) {
	var Game = Class.$extend({
		__init__: function(canvas) {
			this.FPS = 60;
			this.canvas = canvas;
			this.stage = new createjs.Stage(this.canvas);
			this.ticker = createjs.Ticker;
			this.LevelManager = new LevelManager();
			this.level = null;
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
        output: null,

		update: function(event) {
			this.circle.x += event.delta / 1000 * 300;

            if (this.circle.x + 50 > this.stage.canvas.width) {
                this.circle.x = 50;
            }

            this.output.text = "FPS = " + Math.round(createjs.Ticker.getMeasuredFPS());

            this.stage.update(event);
		},

		test: function() {
			this.circle = new createjs.Shape();
			this.circle.graphics.beginFill("blue").drawCircle(100, 100, 50);

            this.output = this.stage.addChild(new createjs.Text("","bold 16px Verdana", "#000"))
            this.output.lineHeight = 15;
            this.output.textBaseline = "top";
            this.output.x = 100;
            this.output.y = 15;
			this.stage.addChild(this.circle);

		}
	});

	return Game;
});