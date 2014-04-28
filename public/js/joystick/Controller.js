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

                this.update = true;
                this.FPS = 30;

                this.lastMoveSent = 0;
                this.moveTimeDelta = 30; // ms

                var self = this;

                this.ticker = createjs.Ticker;
                this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                this.ticker.setFPS(this.FPS);
                this.ticker.on("tick", function(event) {
                    self.updateFunc(event);
                });

                this.createControls();

                navigator.vibrate = navigator.vibrate ||
                    navigator.webkitVibrate ||
                    navigator.mozVibrate ||
                    navigator.msVibrate;

                /*Hammer(canvas).on("drag", function(event) {
                    console.log(event);
                })*/

                this.$window.resize(function() { self.resize(); });
                this.resize();
            },

            __classvars__: {
                SIZE: {
                    padRadius: 100,
                    moverRadius: 40,
                    toolBarHeight: 50,
                    toolBarWidth: 200,
                    toolBarItemSize: 32,
                    weaponSelection: 46
                },

                POS: {
                    padOffset: 30,
                    toolBarOffset: 10
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
                this.addToStage(this.leftPad, 0, 0);

                this.mover = new createjs.Shape();
                this.mover.graphics.beginFill(Controller.COLOR.mover).drawCircle(0, 0, Controller.SIZE.moverRadius).endFill();
                this.addToStage(this.mover, 0, 0);

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
                this.addToStage(this.rightPad, 0, 0);

                var rightPadText = new createjs.Text("Fire!", "50px Arial", "#FF0000");
                this.rightPadText = this.addToStage(rightPadText);

                this.toolBar = new createjs.Shape();
                this.toolBar.graphics
                    .beginFill(Controller.COLOR.toolBar)
                    .drawRoundRect(0, 0, Controller.SIZE.toolBarWidth, Controller.SIZE.toolBarHeight, 10)
                    .endFill();

                this.toolBar = this.addToStage(this.toolBar, Controller.SIZE.toolBarWidth, Controller.SIZE.toolBarHeight);

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

                this.leftPad.x = offset + Controller.SIZE.padRadius;
                this.leftPad.y = offset + Controller.SIZE.padRadius;

                this.mover.x = this.leftPad.x;
                this.mover.y = this.leftPad.y;

                this.rightPad.x = stageSize.width - this.leftPad.x;
                this.rightPad.y = this.leftPad.y;

                this.rightPadText.x = this.rightPad.x;
                this.rightPadText.y = this.rightPad.y;

                this.toolBar.x = stageSize.width / 2;
                this.toolBar.y = stageSize.height - Controller.SIZE.toolBarHeight / 2 - Controller.POS.toolBarOffset;

                var itemSize = Controller.SIZE.toolBarItemSize;

                this.toolBar.knife.x = this.toolBar.x - Controller.SIZE.toolBarWidth / 3;
                this.toolBar.knife.y = this.toolBar.y;

                this.toolBar.pistol.x = this.toolBar.x;
                this.toolBar.pistol.y = this.toolBar.y;

                this.toolBar.shotgun.x = this.toolBar.x + Controller.SIZE.toolBarWidth / 3;
                this.toolBar.shotgun.y = this.toolBar.y;

                this.toolBar.selection.x = this.currentWeapon.x;
                this.toolBar.selection.y = this.currentWeapon.y;

                this.update = true;
            },

            addToStage: function(obj, width, height, noShadow) {
                obj = this.container.addChild(obj);

                if (_.isUndefined(width) || _.isUndefined(height)) {
                    obj.regX = obj.getBounds().width / 2;
                    obj.regY = obj.getBounds().height / 2;
                }
                else {
                    obj.regX = width / 2;
                    obj.regY = height / 2;
                }

                if (!noShadow)
                    obj.shadow = new createjs.Shadow("#000000", 5, 5, 10);

                return obj;
            },

            updateFunc: function(event) {
                //TODO: see icq conversation
                //if (this.update) {
                    this.update = false;
                    this.stage.update(event);
                //}
            },

            sendMoving: function() {
                var target = this.mover;
                var target_prime = {};
                target_prime.x = target.x - this.leftPad.x;
                target_prime.y = target.y - this.leftPad.y;

//                var r = Math.sqrt(target_prime.x * target_prime.x + target_prime.y * target_prime.y);
                var r = -1;
                var eps = 5;
                var deltaActual = this.distance(this.leftPad, target);

                if (deltaActual <= eps) {
                    r = 0;
                }
                else {
                    var deltaIdeal = Controller.SIZE.padRadius - Controller.SIZE.moverRadius;
                    if (deltaIdeal - deltaActual <= eps) {
                        r = 2;
                    }
                    else {
                        r = 1;
                    }
                }

                var phi = (180 / Math.PI) * Math.atan2(target_prime.y, target_prime.x);

                server.send({
                    type: "game",
                    action: "move",
                    r: r,
                    phi: phi
                })
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
                        self.forceUpdate();
                        self.sendMoving();
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

                    var currentMoveTime = (new Date()).getTime();
                    if (self.lastMoveSent === 0 || currentMoveTime - self.lastMoveSent >= self.moveTimeDelta) {
                        self.sendMoving();
                        self.lastMoveSent = currentMoveTime;
                    }

                    self.forceUpdate();
                });

                this.rightPad.on("mousedown", function(evt) {
                    var target = evt.target;
                    target.graphics.clear().beginFill(Controller.SHOOTCOLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();

                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }

                    setTimeout(function() {
                        target.graphics.clear().beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                        self.update = true;
                    }, 400);



                    self.forceUpdate();

                    server.send({
                        type: "game",
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
                return (this.distance(target, this.leftPad) + Controller.SIZE.moverRadius - Controller.SIZE.padRadius <= eps);
            },

            drawCircle: function(object, color, x, y, radius) {
                object.graphics.clear().beginFill(color).drawCircle(x, y, radius).endFill();
                self.forceUpdate();
            },

            forceUpdate: function() {
                this.update = true;
            },

            selectWeapon: function(name, evt) {
                this.currentWeapon = evt.target;
                this.toolBar.selection.x = this.currentWeapon.x;
                this.toolBar.selection.y = this.currentWeapon.y;
                this.forceUpdate();

                server.send({
                    type: "game",
                    action: "weaponchange",
                    weapon: name
                });
            }
        });

        return Controller;
    }
);