define([
    'classy',
    'underscore',
    'game/GameObject',
    'game/KeyCoder'
],
    function(Class, _, GameObject, KeyCoder) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.x = obj.x;
                this.y = obj.y;
                this.state = ( obj.state === "open" ) ? "open" : "closed" ;
                this.tex = ( this.state === "open") ? "door-open" : "door-closed";
                this.activationRadius = 80;
                this.requires = obj.requires;
                this.requiresMessage = this.requires.toString() + " required";
                this.justOpened = false;
                this.justTried = false;
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Open: 1
                }
            },

            update: function(event, player) {
                if (event.keys[KeyCoder.E]) {
                    var vectorToPlayer = {
                        x: player.dispObj.x - this.dispObj.x,
                        y: player.dispObj.y - this.dispObj.y,
                        distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                    };

                    if (vectorToPlayer.distance() <= this.activationRadius) {
                        if (this.state === "closed") {
                            if(_.contains(player.keys, this.requires)) {
                                this.justOpened = true;
                                this.state = "open";
                                this.tex = "door-open";
                            }
                            else if (player.messageCooldown <= 0) {
                                this.justTried = true;
                                player.messageCooldown = 100;
                            }
                        }
                    }
                }
            }
        });

        return Door;
    });
