define([
    'classy',
    'game/AliveObject',
    'collision'
],
    function(Class, AliveObject, collider) {
        var Zombie = AliveObject.$extend({
            __init__: function(obj) {
                this.waypoints = obj.waypoints;
                this.target = obj.waypoints[0];
                this.speed = obj.speed;
                this.currentWaypoint = 0;
                this.canAttack = true;
                this.attackInterval = 1000;
                this.health = 20;
                this.damage = 5;
                this.followDistance = 150;
                this.attackDistance = 20;
            },

            update: function(event, player, collisionObjects) {

                var epsilon = 5, offsetX = 0, offsetY = 0;

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
                    if (this.canAttack && vectorToPlayer.distance() < this.attackDistance) {
                        player.damage(this.damage);
                        this.canAttack = false;
                        var self = this;

                        setTimeout(function() {
                            self.canAttack = true;
                        }, this.attackInterval);
                    }
                }
                else {
                    this.target = this.waypoints[this.currentWaypoint];
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