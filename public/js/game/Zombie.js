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
                this.health = 20;
                this.damage = 5;
                this.followDistance = 150;
                this.attackDistance = 28;
            },

            update: function(event, player, collisionObjects) {

                var epsilon = 5, offsetX = 0, offsetY = 0;

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
                    if (this.canAttack && vectorToPlayer.distance() < this.attackDistance) {
                        player.damage(this.damage);
                        switch (Math.floor(Math.random() * 3)) {
                            case 0:
                                soundjs.Sound.play(ResourceManager.soundList.PlayerHurt1);
                                break;
                            case 1:
                                soundjs.Sound.play(ResourceManager.soundList.PlayerHurt2);
                                break;
                            case 2:
                                soundjs.Sound.play(ResourceManager.soundList.PlayerHurt3);
                                break;
                        }
                        this.canAttack = false;
                        var self = this;

                        setTimeout(function() {
                            self.canAttack = true;
                        }, this.attackInterval);
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