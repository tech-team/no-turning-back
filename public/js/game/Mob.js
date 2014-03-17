define([
    'classy',
    'game/AliveObject',
    'collision'
],
    function(Class, AliveObject, ndgmr) {
        var Mob = AliveObject.$extend({
            __init__: function(obj) {
                this.waypoints = obj.waypoints;
                this.target = obj.waypoints[0];
                this.speed = obj.speed;
                this.currentWaypoint = 0;
            },

            update: function(event) {

                var epsilon = 5;

                var distancesToWaypoints = [];
                distancesToWaypoints.push ({
                    x: (this.waypoints[0].y - this.dispObj.y) / (Math.tan((this.waypoints[0].y - this.dispObj.y) /
                                                                           this.dispObj.x - this.waypoints[0].x))
                });

                var vectorsToWaypoints = [];
                for (var i = 0; i < this.waypoints.length; ++i)
                    vectorsToWaypoints.push ({
                        x: this.waypoints[i].x - this.dispObj.x,
                        y: this.waypoints[i].y - this.dispObj.y
                    })

                var angle = Math.atan2(vectorsToWaypoints[this.currentWaypoint].y,
                                       vectorsToWaypoints[this.currentWaypoint].x);

                this.dispObj.rotation = (180 / Math.PI) * angle;

                if (vectorsToWaypoints[this.currentWaypoint].x != 0) {
                    this.dispObj.x += this.speed * Math.cos(angle);
                }
                if (vectorsToWaypoints[this.currentWaypoint].y != 0) {
                    this.dispObj.y += this.speed * Math.sin(angle);
                }

                if (Math.abs(vectorsToWaypoints[this.currentWaypoint].x) < epsilon &&
                    Math.abs(vectorsToWaypoints[this.currentWaypoint].y) < epsilon)
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

        return Mob;
    });