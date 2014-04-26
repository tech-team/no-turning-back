define([
    'underscore',
    'classy',
    'easel',
    'hammer',
    'joystick/MultiTouchStage'
],
    function(_, Class, createjs, Hammer, MultiTouchStage) {
        var Controller = Class.$extend({
            __init__: function($window, canvas) {
                this.$window = $window;
                this.canvas = canvas;
                this.stage = _.extend(new createjs.Stage(this.canvas), MultiTouchStage);
                this.stage.enableDOMEvents(true);
                this.FPS = 30;

                var self = this;

                this.ticker = createjs.Ticker;
                this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                this.ticker.setFPS(this.FPS);
                this.ticker.on("tick", function(event) {
                    self.update(event);
                });

                this.createControls();

                /*Hammer(canvas).on("drag", function(event) {
                    console.log(event);
                })*/

                this.$window.resize(function() { self.resize(); });
                this.resize();
            },

            __classvars__: {
                SIZE: {
                    padRadius: 150,
                    moverRadius: 60
                },

                POS: {
                    padOffset: 180
                },

                COLOR: {
                    pad: "#DDDDDD",
                    mover: "#FF0000"
                }
            },

            createControls: function() {
                this.leftPad = new createjs.Shape();
                this.leftPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                this.stage.addChild(this.leftPad);

                this.mover = new createjs.Shape();
                this.mover.graphics.beginFill(Controller.COLOR.mover).drawCircle(0, 0, Controller.SIZE.moverRadius);
                this.stage.addChild(this.mover);

                var self = this;
                //like this
                /*Hammer(window).on("drag", function(e) { //ot this.canvas instead of window
                    //TODO: limitations
                    var pos = self.canvas.getBoundingClientRect();
                    pos.x = e.gesture.center.pageX - pos.left;
                    pos.y = e.gesture.center.pageY - pos.top;

                    self.mover.x = pos.x;
                    self.mover.y = pos.y;
                });*/

                //or like this (using MultiTouchStage thingy)
                this.mover.on("drag", function(e) {
                    self.mover.x = e.stageX;
                    self.mover.y = e.stageY;
                });

                this.rightPad = new createjs.Shape();
                this.rightPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius);
                this.stage.addChild(this.rightPad);
            },

            resize: function() {
                this.canvas.width = this.$window.width() - 30;
                this.canvas.height = this.$window.height() - 170;

                var stageSize = {
                    width: this.stage.canvas.width,
                    height: this.stage.canvas.height
                };

                var offset = Controller.POS.padOffset;

                this.leftPad.x = offset;
                this.leftPad.y = offset;

                this.mover.x = offset;
                this.mover.y = offset;

                this.rightPad.x = stageSize.width - offset;
                this.rightPad.y = offset;
            },

            update: function(event) {
                this.stage.update(event);
            }
        });

        return Controller;
    }
);