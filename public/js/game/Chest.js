define([
    'classy',
    'underscore',
    'game/GameObject',
    'game/KeyCoder'
],
    function(Class, _, GameObject, KeyCoder) {
        var Chest = GameObject.$extend({
            __init__: function(obj) {
                this.x = obj.x;
                this.y = obj.y;
                this.storage = obj.storage;
                this.state = ( obj.state === "open" ) ? "open" : "closed" ;
                this.requires = obj.requires;
                this.requiresMessage = this.requires.toString() + " required.";
                this.activationRadius = 50;
                this.tex = ( this.state === "open") ? "chest-open" : "chest";
                this.justTried = false;
                this.justOpened = false;
                this.messageCooldown = 0;
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
                    if (event.keys[KeyCoder.E]) {
                        if (this.state === "closed" && _.contains(player.keys, this.requires)) {
                            this.justOpened = true;
                            this.state = "open";
                            this.tex = "chest-open";
                        }
                        else if (!(_.contains(player.keys, this.requires)) && this.messageCooldown <= 0) {
                            this.justTried = true;
                            this.messageCooldown = 100;
                        }
                    }
                }

                if (this.messageCooldown > 0) {
                    --this.messageCooldown;
                }
            }
        });

        return Chest;
    });