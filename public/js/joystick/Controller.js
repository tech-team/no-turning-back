define([
    'lodash',
    'classy',
    'easel',
    'game/misc/ImageTiler'
],
    function(_, Class, createjs, ImageTiler) {
        var Controller = Class.$extend({
            __classvars__: {
                SIZE: {
                    padRadius: 100,
                    moverRadius: 40,
                    toolBarHeight: 50,
                    toolBarWidth: 200,
                    toolBarItemSize: 32,
                    weaponSelection: 46,
                    usePadWidth: 100,
                    usePadHeight: 50,
                    reconnectPadWidth: 140,
                    reconnectPadHeight: 40,
                    parallaxOffset: 50
                },

                POS: {
                    padOffset: 15,
                    toolBarOffset: 10,
                    reconnectOffset: 30
                },

                COLOR: {
                    pad: "#DDDDDD",
                    mover: "#0000FF",
                    toolBar: "#AAAAAA",
                    weaponSelection: "#BBCCBB"
                },

                PRESSCOLOR: {
                    pad: "#FF0000",
                    use: "#AAAAAA",
                    reconnect: "#AAAAAA"
                },

                WEAPON: ["knife", "pistol", "shotgun"]
            },

            __init__: function(canvas) {
                //TODO: containers, I want containers!
                this.canvas = canvas;
                this.stage = new createjs.Stage(this.canvas);
                this.stage.enableDOMEvents(true);
                createjs.Touch.enable(this.stage);
                this.stage.enableMouseOver(10);
                this.container = new createjs.Container();
                this.stage.addChild(this.container);

                this.FPS = 30;

                this.lastMoveSent = 0;
                this.moveTimeDelta = 10; // ms

                var self = this;

                this.ticker = createjs.Ticker;
                this.ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                this.ticker.setFPS(this.FPS);
                this.ticker.on("tick", this.stage.update.bind(this.stage));

                navigator.vibrate = navigator.vibrate ||
                                    navigator.webkitVibrate ||
                                    navigator.mozVibrate ||
                                    navigator.msVibrate;

                self.createControls();
                self.resize();

                self.requestAvailableWeapons();
            },

            createControls: function() {
                var self = this;
                var gfx = "/res/gfx/large/";

//                var stageSize = {
//                    width: self.stage.canvas.width,
//                    height: self.stage.canvas.height
//                };

                var textShadow = new createjs.Shadow("#333333", 0, 0, 2);

                this.leftPad = new createjs.Shape();
                this.leftPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                this.addToStage({obj: this.leftPad, w: 0, h: 0});

                this.mover = new createjs.Shape();
                this.mover.graphics.beginFill(Controller.COLOR.mover).drawCircle(0, 0, Controller.SIZE.moverRadius).endFill();
                this.addToStage({obj: this.mover, w: 0, h: 0});

                this.rightPad = new createjs.Shape();
                this.rightPad.graphics.beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                this.addToStage({obj: this.rightPad, w: 0, h: 0});

                var rightPadText = new createjs.Text("Fire!", "50px Arial", "#FF0000");
                this.rightPadText = this.addToStage({obj: rightPadText, shadow: textShadow});

                this.usePad = new createjs.Shape();
                this.usePad.graphics.beginFill(Controller.COLOR.pad).drawRoundRect(0, 0, Controller.SIZE.usePadWidth, Controller.SIZE.usePadHeight, 10).endFill();
                this.addToStage({
                        obj: this.usePad,
                        w: Controller.SIZE.usePadWidth,
                        h: Controller.SIZE.usePadHeight
                    });

                var usePadText = new createjs.Text("Use", "30px Arial", "#000000");
                this.usePadText = this.addToStage({obj: usePadText, shadow: textShadow});

                this.reconnectPad = new createjs.Shape();
                this.reconnectPad.graphics.beginFill(Controller.COLOR.pad).drawRoundRect(0, 0, Controller.SIZE.reconnectPadWidth, Controller.SIZE.reconnectPadHeight, 10).endFill();
                this.addToStage({
                    obj: this.reconnectPad,
                    w: Controller.SIZE.reconnectPadWidth,
                    h: Controller.SIZE.reconnectPadHeight});

                var reconnectPadText = new createjs.Text("Reconnect", "22px Arial", "#000000");
                this.reconnectPadText = this.addToStage({obj: reconnectPadText, shadow: textShadow});

                var toolBar = new createjs.Shape();
                toolBar.graphics
                    .beginFill(Controller.COLOR.toolBar)
                    .drawRoundRect(0, 0, Controller.SIZE.toolBarWidth, Controller.SIZE.toolBarHeight, 10)
                    .endFill();

                this.toolBar = this.addToStage({
                    obj: toolBar,
                    w: Controller.SIZE.toolBarWidth,
                    h: Controller.SIZE.toolBarHeight
                });
                this.toolBar.on("mousedown", this.onToolBarClick.bind(this));

                var selection = new createjs.Shape();
                selection.graphics
                    .beginFill(Controller.COLOR.weaponSelection)
                    .drawRoundRect(0, 0, Controller.SIZE.weaponSelection, Controller.SIZE.weaponSelection, 10)
                    .endFill();

                this.toolBar.selection = this.addToStage({
                    obj: selection,
                    w: Controller.SIZE.weaponSelection,
                    h: Controller.SIZE.weaponSelection
                });
                this.toolBar.selection.visible = false;

                this.weapons = {};
                _.each(Controller.WEAPON, function(weaponName) {
                    var dispObj = self.addToStage({
                        obj: new createjs.Bitmap(gfx + weaponName + ".png"),
                        w: Controller.SIZE.toolBarItemSize,
                        h:Controller.SIZE.toolBarItemSize
                    });
                    dispObj.visible = false;

                    self.weapons[weaponName] = dispObj;
                });

                this.createEvents();
            },

            /**
             * Updates controls' positions
             */
            resize: function() {
                var self = this;

                this.createParallax();

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

                this.resizeWeapons();

                this.reconnectPad.x = stageSize.width/2;
                this.reconnectPad.y = Controller.POS.reconnectOffset;

                this.reconnectPadText.x = this.reconnectPad.x;
                this.reconnectPadText.y = this.reconnectPad.y;

                this.usePad.x = stageSize.width/2;
                this.usePad.y = stageSize.height - (Controller.POS.toolBarOffset * 2 + Controller.SIZE.toolBarHeight * 2);

                this.usePadText.x = this.usePad.x;
                this.usePadText.y = this.usePad.y;
            },

            resizeWeapons: function() {
                var self = this;

                var weaponsCount = Controller.WEAPON.length;
                var i = 0;

                _.each(this.weapons, function(w) {
                    w.x = self.toolBar.x + (i - Math.floor(weaponsCount / 2)) * Controller.SIZE.toolBarWidth / weaponsCount;
                    w.y = self.toolBar.y;

                    ++i;
                });

                if (this.currentWeapon) {
                    this.toolBar.selection.x = this.currentWeapon.x;
                    this.toolBar.selection.y = this.currentWeapon.y;
                }
            },

            createParallax: function() {
                var self = this;

                var stageSize = {
                    width: self.stage.canvas.width,
                    height: self.stage.canvas.height
                };

                var gfx = "/res/gfx/large/";

                var parallax = new createjs.Bitmap(gfx + "parallax.jpg");
                parallax.image.onload = function() {
                    parallax.image.onload = null;
                    parallax.image.src = ImageTiler(parallax.image,
                        (stageSize.width + Controller.SIZE.parallaxOffset*2)/parallax.image.width,
                        (stageSize.height + Controller.SIZE.parallaxOffset*2)/parallax.image.height);

                    self.container.removeChild(self.parallax);
                    self.parallax = self.container.addChildAt(parallax, 0);
                    self.parallax.regX = 0;//Controller.SIZE.parallaxOffset;
                    self.parallax.regY = 0;//Controller.SIZE.parallaxOffset;
                };
            },

            /**
             * @param data
             * @param {createjs.Shape|createjs.Text|createjs.Sprite|createjs.Bitmap} data.obj
             * @param {Number} [data.w] width used only for regX, if not specified, obj.getBounds() used instead
             * @param {Number} [data.h] height used only for regY, if not specified, obj.getBounds() used instead
             * @param {?createjs.Shadow} [data.shadow] custom Shadow or null, in not specified default Shadow will be used
             *
             * @returns {DisplayObject}
             */
            addToStage: function(data) {
                var obj = this.container.addChild(data.obj);

                if (_.isUndefined(data.w) || _.isUndefined(data.h)) {
                    obj.regX = obj.getBounds().width / 2;
                    obj.regY = obj.getBounds().height / 2;
                }
                else {
                    obj.regX = data.w / 2;
                    obj.regY = data.h / 2;
                }

                if (_.isUndefined(data.shadow))
                    obj.shadow = new createjs.Shadow("#000000", 0, 0, 10);
                else
                    obj.shadow = data.shadow; //custom or null

                return obj;
            },

            /**
             * Sends repetitive requests to server, until it answers, then calls setAvailableWeapons()
             */
            requestAvailableWeapons: function() {
                var self = this;

                var tid = setInterval(function() {
                    window.server.send({
                        type: 'game',
                        action: 'availableWeapons'
                    }, function(data) {
                        clearInterval(tid);

                        self.setAvailableWeapons(data.availableWeapons);
                        self.selectWeapon(data.currentWeapon);
                    });
                }, 1000);
            },

            setAvailableWeapons: function(weapons) {
                _.each(this.weapons, function(w) {
                    w.visible = false;
                });
                this.toolBar.selection.visible = false;

                _.each(weapons, this.addWeapon.bind(this));
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

                window.server.send({
                    type: "game",
                    action: "move",
                    r: r,
                    phi: phi
                });
            },

            createEvents: function() {
                var self = this;
                this.mover.on("mousedown", function(evt) {
                    evt.preventDefault();
                    //target.parent.addChild(target);
                    self.mover.offset = {x:self.mover.x-evt.stageX, y:self.mover.y-evt.stageY};

                    evt.on("mouseup", function() {
                        self.mover.x = self.leftPad.x;
                        self.mover.y = self.leftPad.y;
                        self.sendMoving();
                    });
                });

                this.mover.on("pressmove", function(evt) {
                    evt.preventDefault();

                    self.mover.x = evt.stageX + self.mover.offset.x;
                    self.mover.y = evt.stageY + self.mover.offset.y;

                    if (!self.checkBounds(self.mover)) {
                        var a = {
                            x: self.leftPad.x,
                            y: self.leftPad.y
                        };
                        var b = {
                            x: self.mover.x,
                            y: self.mover.y
                        };

                        var g = {};
                        g.x = b.x - a.x;
                        g.y = b.y - a.y;

                        var k = Controller.SIZE.padRadius - Controller.SIZE.moverRadius;
                        var D = self.distance(b, a);
                        var m = D - k;

                        g.x *= m / D;
                        g.y *= m / D;

                        self.mover.x -= g.x;
                        self.mover.y -= g.y;
                    }

                    var currentMoveTime = (new Date()).getTime();
                    if (self.lastMoveSent === 0 || currentMoveTime - self.lastMoveSent >= self.moveTimeDelta) {
                        console.log("sending");
                        self.lastMoveSent = currentMoveTime;
                        self.sendMoving();
                    }


                });

                this.rightPad.on("mousedown", function(evt) {
                    self.rightPad.graphics.clear().beginFill(Controller.PRESSCOLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();

                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }

                    setTimeout(function() {
                        self.rightPad.graphics.clear().beginFill(Controller.COLOR.pad).drawCircle(0, 0, Controller.SIZE.padRadius).endFill();
                    }, 400);

                    window.server.send({
                        type: "game",
                        action: "shoot",
                        timestamp: evt.timeStamp
                    });
                });

                this.usePad.on("mousedown", function(evt) {
                    self.usePad.graphics.clear().beginFill(Controller.PRESSCOLOR.use).drawRoundRect(0, 0, Controller.SIZE.usePadWidth, Controller.SIZE.usePadHeight, 10).endFill();

                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }

                    setTimeout(function() {
                        self.usePad.graphics.clear().beginFill(Controller.COLOR.pad).drawRoundRect(0, 0, Controller.SIZE.usePadWidth, Controller.SIZE.usePadHeight, 10).endFill();
                    }, 400);

                    window.server.send({
                        type: "game",
                        action: "use",
                        timestamp: evt.timeStamp
                    });
                });

                this.reconnectPad.on("mousedown", function() {
                    self.reconnectPad.graphics.beginFill(Controller.PRESSCOLOR.reconnect).drawRoundRect(0, 0, Controller.SIZE.reconnectPadWidth, Controller.SIZE.reconnectPadHeight, 10).endFill();

                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }

                    setTimeout(function() {
                        self.reconnectPad.graphics.beginFill(Controller.COLOR.pad).drawRoundRect(0, 0, Controller.SIZE.reconnectPadWidth, Controller.SIZE.reconnectPadHeight, 10).endFill();
                    }, 400);

                    window.location = '#lobby';
                });
            },

            /**
             * {{x: Number, y: Number}} obj1
             * {{x: Number, y: Number}} obj2
             * @returns {Number} distance between 2 points squared
             */
            distanceSq: function(obj1, obj2) {
                var dx = obj2.x - obj1.x;
                var dy = obj2.y - obj1.y;
                return dx * dx + dy * dy;
            },

            /**
             * {{x: Number, y: Number}} obj1
             * {{x: Number, y: Number}} obj2
             * @returns {Number} distance between 2 points squared
             */
            distance: function(obj1, obj2) {
                return Math.sqrt(this.distanceSq(obj1, obj2));
            },

            //TODO: documentation required
            checkBounds: function(target) {
                var eps = 0.01;
                return (this.distance(target, this.leftPad) + Controller.SIZE.moverRadius - Controller.SIZE.padRadius <= eps);
            },

            drawCircle: function(object, color, x, y, radius) {
                object.graphics.clear().beginFill(color).drawCircle(x, y, radius).endFill();
            },

            onToolBarClick: function(evt) {
                var x = evt.stageX - evt.target.x;

                var id = Math.floor(this.map(
                    x,
                    -Controller.SIZE.toolBarWidth / 2,
                    Controller.SIZE.toolBarWidth / 2,
                    0,
                    Controller.WEAPON.length
                ));

                var weaponName = Controller.WEAPON[id];
//                var weapon = this.weapons[weaponName];

                if (this.currentWeapon.weaponName !== weaponName) {
                    this.selectWeapon(weaponName, true);
                }
            },

            selectWeapon: function(weaponName, sendToServer) {
                if (!this.weapons[weaponName].visible) //if it's not available
                    return;

                this.currentWeapon = this.weapons[weaponName];
                this.currentWeapon.weaponName = weaponName;

                this.toolBar.selection.x = this.currentWeapon.x;
                this.toolBar.selection.y = this.currentWeapon.y;

                this.toolBar.selection.visible = true;

                if (sendToServer) {
                    window.server.send({
                        type: "game",
                        action: "weaponchange",
                        weapon: weaponName
                    });
                }

                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            },

            addWeapon: function(name) {
                this.weapons[name].visible = true;
            },

            onGyro: function(e) {
                var obj = deviceOrientation(e);

                var offset = Controller.SIZE.parallaxOffset;

                this.parallax.x = this.map(obj.beta, 0, 360, -offset, offset);
                this.parallax.y = this.map(obj.gamma, 0, 360, -offset, offset);
            },

            /**
             * Scales value x from [in_min, in_max] to [out_min, out_max]
             *
             * @param {Number} x value to scale
             * @param {Number} in_min
             * @param {Number} in_max
             * @param {Number} out_min
             * @param {Number} out_max
             *
             * @returns {Number}
             */
            map: function(x, in_min, in_max, out_min, out_max) {
                return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
            }
        });

        return Controller;
    }
);