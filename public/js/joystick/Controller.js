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
                //this.stage = _.extend(new createjs.Stage(this.canvas), MultiTouchStage);
                this.stage = new createjs.Stage(this.canvas);
                this.stage.enableDOMEvents(true);
                createjs.Touch.enable(this.stage);
                this.stage.enableMouseOver(10);
                this.container = new createjs.Container();
                this.stage.addChild(this.container);
//                stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

                this.update = true;
                this.FPS = 30;

                var self = this;

                this.ticker = createjs.Ticker;
                this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                this.ticker.setFPS(this.FPS);
                this.ticker.on("tick", function(event) {
                    self.updateFunc(event);
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
                    moverRadius: 70
                },

                POS: {
                    padOffset: 180
                },

                COLOR: {
                    pad: "#DDDDDD",
                    mover: "#0000FF"
                },

                SHOOTCOLOR: {
                    pad: "#FF0000"
                }
            },

            createControls: function() {
                this.leftPad = new createjs.Shape();
                this.leftPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                this.container.addChild(this.leftPad);

                this.mover = new createjs.Shape();
                this.mover.graphics.beginFill(Controller.COLOR.mover).drawCircle(0, 0, Controller.SIZE.moverRadius).endFill();
                this.container.addChild(this.mover);

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
                /*this.mover.on("drag", function(e) {
                    self.mover.x = e.stageX;
                    self.mover.y = e.stageY;
                });*/

                this.rightPad = new createjs.Shape();
                this.rightPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                this.container.addChild(this.rightPad);

                var self = this;
                this.mover.on("mousedown", function(evt) {
                    var target = evt.target;
                    target.parent.addChild(target);
                    target.offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
                });

                this.mover.on("pressmove", function(evt) {
                    var target = evt.target;
                    target.x = evt.stageX + target.offset.x;
                    target.y = evt.stageY + target.offset.y;
                    // indicate that the stage should be updated on the next tick:
                    self.update = true;
                });


                this.rightPad.on("click", function(evt) {
                    var target = evt.target;
                    target.graphics.clear().beginFill(Controller.SHOOTCOLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
//                    alert("send");

                    setTimeout(function() {
                        target.graphics.clear().beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                        self.update = true;
                    }, 400);



                    self.update = true;

                    server.send({
                        type: "info",
                        action: "shoot",
                        timestamp: evt.timeStamp
                    });
                });
            },

            drawCircle: function(object, color, x, y, radius) {
                object.graphics.clear().beginFill(color).drawCircle(x, y, radius).endFill();
                self.update = true;
            },

            resize: function() {
                this.canvas.width = this.$window.width();
                this.canvas.height = this.$window.height();

                var self = this;
                var stageSize = {
                    width: self.stage.canvas.width,
                    height: self.stage.canvas.height
                };

                var offset = Controller.POS.padOffset;

                this.leftPad.x = offset;
                this.leftPad.y = offset;

                this.mover.x = offset;
                this.mover.y = offset;

                this.rightPad.x = stageSize.width - offset;
                this.rightPad.y = offset;
            },

            updateFunc: function(event) {
                if (this.update) {
                    this.update = false;
                    this.stage.update(event);
                }
            }
        });

        return Controller;
    }
);