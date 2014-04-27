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
                    moverRadius: 70,
                    toolBarHeight: 50,
                    toolBarWidth: 200,
                    toolBarItemSize: 32,
                    weaponSelection: 46
                },

                POS: {
                    padOffset: 180
                },

                COLOR: {
                    pad: "#DDDDDD",
                    mover: "#0000FF",
                    toolBar: "#AAAAAA",
                    weaponSelection: "#BBCCBB"
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

                var rightPadText = new createjs.Text("Fire!", "50px Arial", "#FF0000");
                rightPadText.shadow = new createjs.Shadow("#000000", 5, 5, 10);
                this.rightPadText = this.container.addChild(rightPadText);

                this.toolBar = new createjs.Shape();
                this.toolBar.graphics
                    .beginFill(Controller.COLOR.toolBar)
                    .drawRoundRect(0, 0, Controller.SIZE.toolBarWidth, Controller.SIZE.toolBarHeight, 10)
                    .endFill();

                this.toolBar = this.container.addChild(this.toolBar);

                this.toolBar.selection = new createjs.Shape();
                this.toolBar.selection.graphics
                    .beginFill(Controller.COLOR.weaponSelection)
                    .drawRoundRect(0, 0, Controller.SIZE.weaponSelection, Controller.SIZE.weaponSelection, 10)
                    .endFill();

                this.toolBar.selection = this.addToStage(this.toolBar.selection, Controller.SIZE.weaponSelection, Controller.SIZE.weaponSelection);

                var gfx = "/res/gfx/";
                var knife = new createjs.Bitmap(gfx + "knife.png");
                this.toolBar.knife = this.addToStage(knife, Controller.SIZE.toolBarItemSize, Controller.SIZE.toolBarItemSize);
                this.toolBar.knife.on("mousedown", this.selectWeapon.bind(this, "knife"));

                var pistol = new createjs.Bitmap(gfx + "pistol.png");
                this.toolBar.pistol = this.addToStage(pistol, Controller.SIZE.toolBarItemSize, Controller.SIZE.toolBarItemSize);
                this.toolBar.pistol.on("mousedown", this.selectWeapon.bind(this, "pistol"));

                var shotgun = new createjs.Bitmap(gfx + "shotgun.png");
                this.toolBar.shotgun = this.addToStage(shotgun, Controller.SIZE.toolBarItemSize, Controller.SIZE.toolBarItemSize);
                this.toolBar.shotgun.on("mousedown", this.selectWeapon.bind(this, "shotgun"));

                this.currentWeapon = this.toolBar.knife;

                this.createEvents();
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

                this.rightPadText.x = this.rightPad.x - this.rightPadText.getBounds().width/2;
                this.rightPadText.y = this.rightPad.y - this.rightPadText.getBounds().height/2;


                this.toolBar.regX = Controller.SIZE.toolBarWidth / 2;
                this.toolBar.regY = Controller.SIZE.toolBarHeight / 2;

                this.toolBar.x = stageSize.width / 2;
                this.toolBar.y = stageSize.height - Controller.SIZE.toolBarHeight * 1.5;

                var itemSize = Controller.SIZE.toolBarItemSize;

                this.toolBar.knife.x = this.toolBar.x - Controller.SIZE.toolBarWidth / 3;
                this.toolBar.knife.y = this.toolBar.y;

                this.toolBar.pistol.x = this.toolBar.x;
                this.toolBar.pistol.y = this.toolBar.y;

                this.toolBar.shotgun.x = this.toolBar.x + Controller.SIZE.toolBarWidth / 3;
                this.toolBar.shotgun.y = this.toolBar.y;

                this.toolBar.selection.x = this.currentWeapon.x;
                this.toolBar.selection.y = this.currentWeapon.y;
            },

            addToStage: function(obj, width, height) {
                obj = this.container.addChild(obj);

                if (!width || !height) {
                    obj.regX = obj.getBounds().width / 2;
                    obj.regY = obj.getBounds().height / 2;
                }
                else {
                    obj.regX = width / 2;
                    obj.regY = height / 2;
                }

                return obj;
            },

            updateFunc: function(event) {
                if (this.update) {
                    this.update = false;
                    this.stage.update(event);
                }
            },

            createEvents: function() {
                var self = this;
                this.mover.on("mousedown", function(evt) {
                    evt.preventDefault();
                    var target = evt.target;
                    target.parent.addChild(target);
                    target.offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};

                    evt.on("mouseup", function(evt) {
                        var target = evt.target;
                        target.x = self.leftPad.x;
                        target.y = self.leftPad.y;
                    });
                });

                this.mover.on("pressmove", function(evt) {
                    evt.preventDefault();
                    var target = evt.target;

                    target.x = evt.stageX + target.offset.x;
                    target.y = evt.stageY + target.offset.y;

                    if (!self.checkBounds(target)) {
                        var a = {
                            x: self.leftPad.x,
                            y: self.leftPad.y
                        };
                        var b = {
                            x: target.x,
                            y: target.y
                        };

                        var g = {};
                        g.x = b.x - a.x;
                        g.y = b.y - a.y;

                        var k = Controller.SIZE.padRadius - Controller.SIZE.moverRadius;
                        var D = self.distance(b, a);
                        var m = D - k;

                        g.x *= m / D;
                        g.y *= m / D;

                        target.x -= g.x;
                        target.y -= g.y;
                    }

                    self.update = true;
                });

                this.rightPad.on("mousedown", function(evt) {
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

            distanceSq: function(obj1, obj2) {
                var dx = obj2.x - obj1.x;
                var dy = obj2.y - obj1.y;
                return dx * dx + dy * dy;
            },

            distance: function(obj1, obj2) {
                return Math.sqrt(this.distanceSq(obj1, obj2));
            },

            checkBounds: function(target) {
                var eps = 0.01;
                if (this.distance(target, this.leftPad) + Controller.SIZE.moverRadius - Controller.SIZE.padRadius <= eps)
                    return true;
                return false;
            },

            drawCircle: function(object, color, x, y, radius) {
                object.graphics.clear().beginFill(color).drawCircle(x, y, radius).endFill();
                self.update = true;
            },

            forceUpdate: function() {
                this.update = true;
            },

            selectWeapon: function(name, evt) {
                this.currentWeapon = evt.target;
                this.toolBar.selection.x = this.currentWeapon.x;
                this.toolBar.selection.y = this.currentWeapon.y;
                this.forceUpdate();
                alert(name);
            }
        });

        return Controller;
    }
);