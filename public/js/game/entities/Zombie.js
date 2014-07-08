define([
    'game/entities/AliveObject',
    'game/ResourceManager',
    'game/misc/Vector',
    'game/weapons/Weapons'
],
    function(AliveObject, ResourceManager, Vector, Weapons) {
        var Zombie = AliveObject.$extend({
            __init__: function(dispObj) {
                this.$super(dispObj);

                this.health = this._health();
                this.target = (this.waypoints().length != 0) ? (this.waypoints()[0]) : (null);

                this.currentWeapon = this._weapon();
                this.weapons = {};
                this.addWeapon(this.currentWeapon);

                this.currentWaypoint = 0;
                this.canAttack = true;
                this.canMove = true;

                this.justFired = false;
            },

            __classvars__: {
                EntityName: "zombie",

                DefaultHealth: 20,
                DefaultFollowDistance: 150,
                DefaultSpeed: 2,
                DefaultDamage: 5,
                Reach: 40,
                DefaultAttackInterval: 1000,

                FireDelayModifier: {
                    pistol: 1.5,
                    shotgun: 1.5
                },

                DefaultWeapon: "fist"
            },

            _health: function() {
                return this.dispObj.data.health || Zombie.DefaultHealth;
            },

            damageAmount: function() {
                return this.dispObj.data.damage || Zombie.DefaultDamage;
            },

            followDistance: function() {
                return this.dispObj.data.followDistance || Zombie.DefaultFollowDistance;
            },

            attackInterval: function() {
                return this.dispObj.data.attackInterval || Zombie.DefaultAttackInterval;
            },

            waypoints: function() {
                return this.dispObj.data.waypoints || [];
            },

            speed: function() {
                return this.dispObj.data.speed || Zombie.DefaultSpeed;
            },

            drops: function() {
                return this.dispObj.data.drops || [];
            },

            _weapon: function() {
                return this.dispObj.data.weapon || Zombie.DefaultWeapon;
            },

            addWeapon: function(name) {
                var data = _.extend(_.clone(ResourceManager.weaponData[name]), {
                    power: this.damageAmount()
                });
                this.weapons[this.currentWeapon] = new Weapons[name](Infinity, data);
            },

            isCurrentWeaponMelee: function() {
                return this.weapons[this.currentWeapon].melee;
            },

            shoot: function(level, targets) {
                var self = this;

                this.justFired = false;

                var shot = false;
                if (targets)
                    shot = this.weapons[this.currentWeapon].shoot(this, targets);
                else
                    shot = this.weapons[this.currentWeapon].shoot(Zombie.EntityName, this, level);

                //this is optional thing
                if (shot) {
                   this.canMove = false;
                   setTimeout(function() {
                       self.canMove = true;
                   }, 900);
                }

                return shot;
            },

            damage: function(howMuch) {
                this.health -= howMuch;
            },

            update: function(event, player, collisionObjects) {
                var self = this;
                var epsilon = 5, offsetX = 0, offsetY = 0;

                if (this.target == null) {
                    this.target = this.dispObj;
                }

                var vectorsToWaypoint = new Vector({
                    x: this.target.x - this.x(),
                    y: this.target.y - this.y()
                });

                var vectorToPlayer = new Vector({
                    x: player.x() - this.x(),
                    y: player.y() - this.y()
                });

                var vectorToPlayerDistance = vectorToPlayer.distance();
                var angle = vectorsToWaypoint.angle();

                var oldRotation = this.dispObj.rotation;
                var newRotation = (180 / Math.PI) * angle;

                if (Math.abs(newRotation - oldRotation) > 1) {
                    this.dispObj.rotation = newRotation;

                    //check collisions
                    if (_.any(collisionObjects, function(obj) {
                        return obj != self.dispObj && self.collidesWith(obj);
                    })) {
                        this.dispObj.rotation = oldRotation;
                    }
                }

                if (vectorToPlayerDistance < this.followDistance()) {
                    this.target = player.dispObj;
                    if (this.canAttack) {
                        var delay = null;

                        this.justFired = true;
                        this.canAttack = false;

                        if (this.weapons[this.currentWeapon].melee) {
                            delay = 1;
                        } else {
                            delay = Zombie.FireDelayModifier[this.currentWeapon];
                        }

                        if (delay) {
                            setTimeout(function () {
                                self.canAttack = true;
                            }, delay * this.attackInterval());
                        }
                    }
                }
                else if (this.waypoints().length > 0) {
                    this.target = this.waypoints()[this.currentWaypoint];
                }
                else {
                    this.target = this.dispObj;
                }

                if (vectorToPlayerDistance > Zombie.Reach && this.canMove) {
                    var oldX = this.dispObj.x;
                    var oldY = this.dispObj.y;

                    if (vectorsToWaypoint.x != 0) {
                        offsetX = this.speed() * Math.cos(angle);
                        this.dispObj.x += offsetX;
                    }
                    if (vectorsToWaypoint.y != 0) {
                        offsetY = this.speed() * Math.sin(angle);
                        this.dispObj.y += offsetY;
                    }

                    //check collisions
                    if (_.any(collisionObjects, function(obj) {
                        return obj != self.dispObj && self.collidesWith(obj);
                    })) {
                        this.dispObj.x = oldX;
                        this.dispObj.y = oldY;
                    }
                }

                if (Math.abs(vectorsToWaypoint.x) < epsilon &&
                    Math.abs(vectorsToWaypoint.y) < epsilon &&
                    this.target != player.dispObj)
                {
                    if (++this.currentWaypoint < this.waypoints().length) {
                        this.target = this.waypoints()[this.currentWaypoint];
                    }
                    else {
                        this.currentWaypoint = 0;
                        this.target = this.waypoints()[this.currentWaypoint];
                    }
                }
            }
        });

        return Zombie;
    });