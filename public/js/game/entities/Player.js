define([
	'classy',
	'game/entities/AliveObject',
    'game/ResourceManager',
    'game/misc/UntilTimer',
    'game/misc/Messenger',
    'game/misc/KeyCoder',
    'collision',
    'game/weapons/Weapons'
],
function(Class, AliveObject, ResourceManager, UntilTimer, Messenger, KeyCoder, collider, Weapons) {
	var Player = AliveObject.$extend({
		__init__: function() {
            this.type = "player"; //type should be specified in each class it its' objects will be passed to addToStage
            this.health = 100;
            this.maxHealth = 100;
            this.dead = false;
			this.score = 0;
            this.shootCooldown = 0;
            this.messageCooldown = 0;
            this.saturationTime = 0;
            this.effects = null;
            this.currentWeapon = null;
            this.weapons = { };
            this.inventory = [];
            this.keys = [];

            this.power = 5;
            this.reach = 50;
            this.healthDecrease = 0.1;
		},


        setEffects: function(effects) {
            this.effects = effects;
        },

        hasWeapon: function(name) {
            return name in this.weapons;
        },

        addWeapon: function(name, ammo) {
            this.weapons[name] = new Weapons[name](ammo, ResourceManager.weaponData[name]);
        },

        hasAmmo: function(name) {
            return this.weapons[name].ammo > 0;
        },

        hasCurrentAmmo: function() {
            return this.hasAmmo(this.currentWeapon);
        },

        addAmmo: function(name, ammo) {
            this.weapons[name].addAmmo(ammo);
        },

        isCurrentWeaponImmediate: function() {
            return this.weapons[this.currentWeapon].immediate;
        },

        shoot: function(level) {
            return this.weapons[this.currentWeapon].shoot(level);
        },

		update: function(event, collisionObjects) {
            if (this.shootCooldown > 0) {
                --this.shootCooldown;
            }
            if (this.messageCooldown > 0) {
                --this.messageCooldown;
            }
            if (this.saturationTime > 0) {
                --this.saturationTime;
            }
            if (this.health > this.maxHealth && this.saturationTime === 0) {
                var healthLeft = this.health - this.healthDecrease;
                this.health = (healthLeft < this.maxHealth) ? (this.maxHealth) : (healthLeft);
            }

            var speedModifier = 2;
            var reboundModifier = 1.1;
            var offsetRotation = 4;
            var offsetX, offsetY;



            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.x += offsetX;
                this.dispObj.y += offsetY;
                for (var i = 0; i < collisionObjects.length; ++i) {
                    if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                        this.dispObj.x -= reboundModifier * offsetX;
                        this.dispObj.y -= reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.x += (reboundModifier - 1) * offsetX;
                            this.dispObj.y += (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation += reboundModifier * offsetRotation;
                        }
                    }
                }
            }
            if (event.keys[KeyCoder.S]) {
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.x -= offsetX;
                this.dispObj.y -= offsetY;
                for (var i = 0; i < collisionObjects.length; ++i) {
                    if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                        this.dispObj.x += reboundModifier * offsetX;
                        this.dispObj.y += reboundModifier * offsetY;
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.x -= (reboundModifier - 1) * offsetX;
                            this.dispObj.y -= (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation += reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation -= reboundModifier * offsetRotation;
                        }
                    }
                }
            }

            if (!(event.keys[KeyCoder.W] || event.keys[KeyCoder.S])) {
                if (event.keys[KeyCoder.D]) {
                    offsetRotation *= 2;
                    this.dispObj.rotation += offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation -= offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    offsetRotation *= 2;
                    this.dispObj.rotation -= offsetRotation;
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                            this.dispObj.rotation += offsetRotation;

                        }
                    }
                }
            }


            if(event.keys[KeyCoder.K]) {
                this.keys.forEach(function(key) {
                    console.log(key + " ");
                });
            }
            if(event.keys[KeyCoder.I]) {
                this.inventory.forEach(function(item) {
                    console.log(item + " ");
                });
            }
            if(event.keys[KeyCoder.O]) {
                for (var weapon in this.weapons) {
                    console.log(weapon + " : " + this.weapons[weapon]);
                }
            }
        },

        movementHandle: function(movementData, collisionObjects) {
            //TODO: Movement code refactoring will be carried out only after implementing two-joystick handling
            var reboundModifier = 1;

            while (Math.abs(this.dispObj.rotation) > 180) {
                this.dispObj.rotation -= (this.dispObj.rotation > 0) ? (360) : (-360);
            }
            var currentRotation = this.dispObj.rotation;
            this.dispObj.rotation = movementData.angle;

            this.dispObj.angle = (Math.PI / 180) * this.dispObj.rotation;

            var offsetX = movementData.speedModifier * Math.cos(this.dispObj.angle);
            var offsetY = movementData.speedModifier * Math.sin(this.dispObj.angle);
            this.dispObj.x += offsetX;
            this.dispObj.y += offsetY;

            for (var i = 0; i < collisionObjects.length; ++i) {
                if (collider.checkPixelCollision (this.dispObj, collisionObjects[i])) {
                    this.dispObj.x -= reboundModifier * offsetX;
                    this.dispObj.y -= reboundModifier * offsetY;
                    this.dispObj.rotation = currentRotation;
                }
            }
        },

        damage: function(howMuch) {
            this.health -= howMuch;
            //TODO: should be replaced with UntilTimer
            //well that and heal() function cannot be replaced by UntilTimer
            //because UntilTimer tick speed is uncontrollable

            var damageEffect = this.effects.damage;
            damageEffect.alpha = 1;
            damageEffect.visible = true;
            var tid = setInterval(function() {
                if (damageEffect.alpha > 0)
                    damageEffect.alpha -= 0.05;
                else {
                    damageEffect.visible = false;
                    clearInterval(tid);
                }
            }, 50);
        },

        heal: function(howMuch) {
            ResourceManager.playSound(ResourceManager.soundList.Medkit);

            //please note, that amount of health to be healed is unpredictable
            //because player can be hurt in process
            Messenger.showMessage(Messenger.healPackPicked, howMuch);

            var self = this;
            var tid = setInterval(function() {
                if (howMuch > 0) {
                    howMuch--;

                    self.health++;
                }
                else {
                    self.saturationTime = 100;
                    //healing finished
                    clearInterval(tid);
                }
            }, 50);
        },

        isDead: function() {
            return this.health <= 0;
        }
	});

	return Player;
});