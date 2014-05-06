define([
    'classy',
    'game/AliveObject',
    'game/ResourceManager',
    'sound',
    'collision'
],
    function(Class, AliveObject, ResourceManager, soundjs, collider) {
        var Zombie = AliveObject.$extend({
            __init__: function(obj) {
                this.waypoints = obj.waypoints;
                this.target = (this.waypoints.length != 0) ? (this.waypoints[0]) : (null);
                this.speed = obj.speed;
                this.drops = obj.drops;
                this.currentWaypoint = 0;
                this.canAttack = true;
                this.attackInterval = 1000;
                this.weapon = obj.weapon || "";
                this.health = 20;
                this.damage = 5;
                this.followDistance = obj.followDistance || 150;
                this.attackDistance = 30;
                this.justFired = "";
            },

            update: function(event, player, collisionObjects) {

                var epsilon = 5, offsetX = 0, offsetY = 0;
                var pistolFireDelayModifier= 1.5;

                if (this.target == null) {
                    this.target = this.dispObj;
                }

                var vectorsToWaypoint = {
                    x: this.target.x - this.dispObj.x,
                    y: this.target.y - this.dispObj.y
                };

                var vectorToPlayer = {
                    x: player.dispObj.x - this.dispObj.x,
                    y: player.dispObj.y - this.dispObj.y,
                    distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                };

                var angle = Math.atan2(vectorsToWaypoint.y,
                                       vectorsToWaypoint.x);

                this.dispObj.rotation = (180 / Math.PI) * angle;

                if (vectorToPlayer.distance() < this.followDistance) {
                    this.target = player.dispObj;
                    if (this.canAttack) {
                        var self = this;
                        if (!this.weapon && vectorToPlayer.distance() <= this.attackDistance) {
                            player.damage(this.damage);
                            ResourceManager.playSound(ResourceManager.soundList.PlayerHurt);
                            this.canAttack = false;

                            setTimeout(function() {
                                self.canAttack = true;
                            }, this.attackInterval);
                        }
                        else if (this.weapon === "pistol") {
                            this.justFired = "pistol";

                            this.canAttack = false;

                            setTimeout(function() {
                                self.canAttack = true;
                            }, pistolFireDelayModifier * this.attackInterval);
                        }
                    }
                }
                else if (this.waypoints.length > 0) {
                    this.target = this.waypoints[this.currentWaypoint];
                }
                else {
                    this.target = this.dispObj;
                }

                if (vectorToPlayer.distance() > this.attackDistance) {
                    if (vectorsToWaypoint.x != 0) {
                        offsetX = this.speed * Math.cos(angle);
                        this.dispObj.x += offsetX;
                    }
                    if (vectorsToWaypoint.y != 0) {
                        offsetY = this.speed * Math.sin(angle);
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
                    if (++this.currentWaypoint < this.waypoints.length) {
                        this.target = this.waypoints[this.currentWaypoint];
                    }
                    else {
                        this.currentWaypoint = 0;
                        this.target = this.waypoints[this.currentWaypoint];
                    }
                }



            }
        });

        return Zombie;
    });