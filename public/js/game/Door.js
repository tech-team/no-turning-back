define([
    'classy',
    'game/GameObject',
    'game/KeyCoder'
],
    function(Class, GameObject, KeyCoder) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.x = obj.x;
                this.y = obj.y;
                this.state = ( obj.state === "open" ) ? "open" : "closed" ;
                this.tex = ( this.state === "open") ? "door-open" : "door-closed";
                this.activationRadius = 80;
                this.requires = obj.requires;
                this.justOpened = false;
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Open: 1
                }
            },

            update: function(event, player) {
                var vectorToPlayer = {
                    x: player.dispObj.x - this.dispObj.x,
                    y: player.dispObj.y - this.dispObj.y,
                    distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                };

                if (vectorToPlayer.distance() <= this.activationRadius) {
                    if (event.keys[KeyCoder.Z]) {
                        for (var i = 0; i < player.keys.length; ++i) {
                            if (this.state == "closed" && player.keys[i] === this.requires) {
                                this.justOpened = true;
                                this.state = "open";
                                this.tex = "door-open";
                            }
                        }
                    }
                }
            }
        });

        return Door;
    });
