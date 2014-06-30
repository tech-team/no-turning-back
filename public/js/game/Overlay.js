define([
    'classy',
    'lodash',
    'easel',
    'game/ResourceManager',
    'game/misc/UntilTimer'
],
    function(Class, _, easeljs, ResourceManager, UntilTimer) {
        var Overlay = Class.$extend({
            __init__: function(stage) {
                this.stage = stage;

                //setup graphics
                var rm = ResourceManager.getInstance();

                this.overlayBar = this.stage.addChild(
                    new easeljs.Sprite(rm.getSpriteSheet("overlay/OverlayBar")));

                //set default values
                this.healthText = this._createText("Health: 100");
                this.armorText = this._createText("Armor: 100");
                this.weaponText = this._createText("knife");
                this.ammoText = this._createText("0 / 0");
                this.scoreText = this._createText("Score: 0");

                if (DEBUG)
                    this.fpsText = this._createText("FPS: 0");
            },

            _createText: function(str) {
                var text = new easeljs.Text(str, "20px Arial", "#00FF00");
                text.shadow = new easeljs.Shadow("#000000", 5, 5, 10);
                return this.stage.addChild(text);
            },

            setArmor: function(value) {
                this.armorText.text = "Armor: " + Math.ceil(value);
            },

            setHealth: function(value) {
                this.healthText.text = "Health: " + Math.ceil(value);
            },

            setAmmo: function(value) {
                if (value.current == Infinity || value.total == Infinity) {
                    value.current = "--";
                    value.total = "--";
                }
                this.ammoText.text = value.current + " / " + value.total;
            },

            addWeapon: function(name) {
                //add weapon on bar
            },

            setWeapon: function(name, ammoInfo) {
                //TODO: select weapon on bar
                this.weaponText.text = name;
                if (ammoInfo)
                    this.setAmmo(ammoInfo);
            },

            addItem: function(name) {
                //add sprite on stage
            },

            addKey: function(name) {
                //add sprite on stage
            },

            setScore: function(value) {
                this.scoreText.text = "Score: " + value;
            },

            setFPS: function(value) {
                this.fpsText.text = "FPS: " + Math.round(value);
            },

            resize: function() {
                var canvas = {
                    width: this.stage.canvas.width,
                    height: this.stage.canvas.height
                };

                var scaleFactor = canvas.width/1280;

                this.overlayBar.x = 0;
                this.overlayBar.y = canvas.height - this.overlayBar.getBounds().height + 32;
                this.overlayBar.scaleX = scaleFactor;
                this.overlayBar.scaleY = scaleFactor;

                var toolbarHeight = canvas.height - 32;

                this.healthText.x = 20;
                this.healthText.y = toolbarHeight;

                this.armorText.x = 20;
                this.armorText.y = toolbarHeight - 32;

                this.weaponText.x = canvas.width - 100;
                this.weaponText.y = toolbarHeight - 32;

                this.ammoText.x = canvas.width - 100;
                this.ammoText.y = toolbarHeight;

                this.scoreText.x = canvas.width/2;
                this.scoreText.y = toolbarHeight;

                this.fpsText.x = canvas.width - 90;
                this.fpsText.y = 80;
            }
        });
        
        return Overlay;
    }
);