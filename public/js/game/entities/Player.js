define([
    'game/entities/AliveObject',
    'signals',
    'game/ResourceManager',
    'game/misc/UntilTimer',
    'game/misc/KeyCoder',
    'game/weapons/Weapons'
],
function(AliveObject, signals, ResourceManager, UntilTimer, KeyCoder, Weapons) {
	var Player = AliveObject.$extend({
		__init__: function(dispObj) {
            this.$super(dispObj);

            this.dead = false;
			this.score = 0;
            this.shootCooldown = 0;
            this.messageCooldown = 0;
            this.saturationTime = 0;
            this.effects = null;
            this.events = null;

            this.currentWeapon = "knife";
            this.weapons = { };
            this.addWeapon(this.currentWeapon);
		},

        __classvars__: {
            EntityName: "player",

            weaponSpecificTex: function(weapon) {
                return 'player-{0}'.format(weapon);
            },

            getAvailableWeapons: function() {
                return _.keys(Weapons);
            },

            Reach: 50,
            MaxHealth: 100,
            OverSaturationHealthDecrease: 0.1
        },

        createEvents: function() {
            this.events = {
                healthChanged: new signals.Signal(),
                armorChanged: new signals.Signal(),
                ammoChanged: new signals.Signal(),
                weaponAdded: new signals.Signal(),
                weaponChanged: new signals.Signal(),
                itemAdded: new signals.Signal(),
                keyAdded: new signals.Signal(),
                scoreChanged: new signals.Signal()
            };

            return this.events;
        },

        health: function() {
            return this.dispObj.data.health;
        },

        _setHealth: function(value) {
            this.dispObj.data.health = value;
            this.events.healthChanged.dispatch(value);
        },

        armor: function() {
            return this.dispObj.data.armor;
        },

        _setArmor: function(value) {
            this.dispObj.data.armor = value;
            this.events.armorChanged.dispatch(value);
        },

        ammo: function() {
            return this.weapons[this.currentWeapon].getAmmo();
        },

        addScore: function(value) {
            this.score += value;
            this.events.scoreChanged.dispatch(this.score);
        },

        inventory: function() {
            return this.dispObj.data.inventory;
        },

        addToInventory: function(item) {
            this.dispObj.data.inventory.push(item);
            this.events.itemAdded.dispatch(item);
        },

        clearInventory: function() {
            this.dispObj.data.inventory = [];
        },

        keys: function() {
            return this.dispObj.data.keys;
        },

        addToKeys: function(key) {
            this.dispObj.data.keys.push(key);
            this.events.keyAdded.dispatch(key);
        },

        //TODO: rename to onLevelFinished/prepareToNextLevel
        clearKeys: function() {
            this.dispObj.data.keys = [];
        },

        tex: function() {
            return this.dispObj.data.tex;
        },

        changeTexture: function(weapon) {
            this.dispObj.data.tex = this.$class.weaponSpecificTex(weapon);
            return this.tex();
        },

        setEffects: function(effects) {
            this.effects = effects;
        },

        hasWeapon: function(name) {
            return name in this.weapons;
        },

        addWeapon: function(name, ammo) {
            if (!ammo)
                ammo = Infinity;
            this.weapons[name] = new Weapons[name](ammo, ResourceManager.weaponData[name]);
            this.events && this.events.weaponAdded.dispatch(name); //JS needs safe navigation operator (?.)
        },

        hasAmmo: function(name) {
            return this.weapons[name].hasAmmo();
        },

        hasCurrentAmmo: function() {
            return this.hasAmmo(this.currentWeapon);
        },

        addAmmo: function(name, ammo) {
            this.weapons[name].addAmmo(ammo);

            if (name == this.currentWeapon) {
                var ammoData = this.weapons[this.currentWeapon].getAmmo();
                this.events.ammoChanged.dispatch(ammoData);
            }
        },

        isCurrentWeaponMelee: function() {
            return this.weapons[this.currentWeapon].melee;
        },

        changeWeapon: function(name) {
            if (this.hasWeapon(name) && this.currentWeapon != name) {
                this.currentWeapon = name;
                this.changeTexture(this.currentWeapon);
                this.shootCooldown = ResourceManager.weaponData.drawCooldown;
                this.events.weaponChanged.dispatch(this.currentWeapon, this.weapons[this.currentWeapon].getAmmo());
            }
        },

        shoot: function(level, targets) {
            var shot = null;

            if (targets)
                shot = this.weapons[this.currentWeapon].shoot(this, targets);
            else
                shot = this.weapons[this.currentWeapon].shoot(Player.EntityName, this, level);

            if (shot) {
                var ammoData = this.weapons[this.currentWeapon].getAmmo();
                this.events.ammoChanged.dispatch(ammoData);
            }

            return shot;
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
            if (this.health() > Player.MaxHealth && this.saturationTime === 0) {
                var healthLeft = this.health() - Player.OverSaturationHealthDecrease;
                this._setHealth(healthLeft < Player.MaxHealth ? Player.MaxHealth : healthLeft);
            }

            var speedModifier = 2;
            var reboundModifier = 1.1;
            var offsetRotation = 4;
            var offsetX, offsetY;

            var i = 0;


            if (event.keys[KeyCoder.W]) {
                if (event.keys[KeyCoder.SHIFT]) { speedModifier = 4; }
                offsetX = speedModifier * Math.cos( (Math.PI / 180) * this.dispObj.rotation);
                offsetY = speedModifier * Math.sin( (Math.PI / 180) * this.dispObj.rotation);
                this.dispObj.x += offsetX;
                this.dispObj.y += offsetY;
                for (i = 0; i < collisionObjects.length; ++i) {
                    if (this.collidesWith(collisionObjects[i])) {
                        this.dispObj.x -= reboundModifier * offsetX;
                        this.dispObj.y -= reboundModifier * offsetY;
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.x += (reboundModifier - 1) * offsetX;
                            this.dispObj.y += (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.dispObj.rotation += offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.rotation -= reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.dispObj.rotation -= offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
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
                for (i = 0; i < collisionObjects.length; ++i) {
                    if (this.collidesWith(collisionObjects[i])) {
                        this.dispObj.x += reboundModifier * offsetX;
                        this.dispObj.y += reboundModifier * offsetY;
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.x -= (reboundModifier - 1) * offsetX;
                            this.dispObj.y -= (reboundModifier - 1) * offsetY;
                        }
                    }
                }
                if (event.keys[KeyCoder.D]) {
                    this.dispObj.rotation -= offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.rotation += reboundModifier * offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    this.dispObj.rotation += offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.rotation -= reboundModifier * offsetRotation;
                        }
                    }
                }
            }

            if (!(event.keys[KeyCoder.W] || event.keys[KeyCoder.S])) {
                if (event.keys[KeyCoder.D]) {
                    offsetRotation *= 2;
                    this.dispObj.rotation += offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.rotation -= offsetRotation;

                        }
                    }
                }
                if (event.keys[KeyCoder.A]) {
                    offsetRotation *= 2;
                    this.dispObj.rotation -= offsetRotation;
                    for (i = 0; i < collisionObjects.length; ++i) {
                        if (this.collidesWith(collisionObjects[i])) {
                            this.dispObj.rotation += offsetRotation;

                        }
                    }
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
                if (this.collidesWith(collisionObjects[i])) {
                    this.dispObj.x -= reboundModifier * offsetX;
                    this.dispObj.y -= reboundModifier * offsetY;
                    this.dispObj.rotation = currentRotation;
                }
            }
        },

        damage: function(howMuch) {
            this._setHealth(this.health() - howMuch);
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
            var self = this;
            var tid = setInterval(function() {
                if (howMuch > 0) {
                    howMuch--;

                    self._setHealth(self.health() + 1);
                }
                else {
                    self.saturationTime = 100;
                    //healing finished
                    clearInterval(tid);
                }
            }, 50);
        },

        isDead: function() {
            return this.health() <= 0;
        }
	});

	return Player;
});