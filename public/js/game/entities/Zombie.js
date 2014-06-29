define([
    'game/entities/AliveObject',
    'game/ResourceManager',
    'collision',
    'game/misc/Vector',
    'game/weapons/Weapons'
],
    function(AliveObject, ResourceManager, collider, Vector, Weapons) {
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

                this.justFired = false;
            },

            __classvars__: {
                EntityName: "zombie",

                DefaultHealth: 20,
                DefaultFollowDistance: 150,
                DefaultSpeed: 2,
                DefaultDamage: 5,
                Reach: 30,
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
                this.justFired = false;
                if (targets)
                    return this.weapons[this.currentWeapon].shoot(this, targets);
                else
                    return this.weapons[this.currentWeapon].shoot(Zombie.EntityName, this, level);
            },


            damage: function(howMuch) {
                this.health -= howMuch;
            },



            update: function(event, player, collisionObjects) {

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

                this.dispObj.rotation = (180 / Math.PI) * angle;

                if (vectorToPlayerDistance < this.followDistance()) {
                    this.target = player.dispObj;
                    if (this.canAttack) {
                        var self = this;
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

                if (vectorToPlayerDistance > Zombie.Reach) {
                    if (vectorsToWaypoint.x != 0) {
                        offsetX = this.speed() * Math.cos(angle);
                        this.dispObj.x += offsetX;
                    }
                    if (vectorsToWaypoint.y != 0) {
                        offsetY = this.speed() * Math.sin(angle);
                        this.dispObj.y += offsetY;
                    }
                    for (var i = 0; i < collisionObjects.length; ++i) {
                        if (collider.checkPixelCollision(this.dispObj, collisionObjects[i]) &&
                            collisionObjects[i] != this.dispObj) {
                            this.dispObj.x -= offsetX;
                            this.dispObj.y -= offsetY;
                        }
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