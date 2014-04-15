define([
    'classy',
    'game/GameObject',
    'game/KeyCoder'
],
    function(Class, GameObject, KeyCoder) {
        var Chest = GameObject.$extend({
            __init__: function(obj) {
                this.x = obj.x;
                this.y = obj.y;
                this.storage = obj.storage;
                this.state = ( obj.state === "open" ) ? Chest.State.Open : Chest.State.Closed ;
                this.requires = obj.requires;
                this.activationRadius = 50;
                this.tex = ( this.state === "open") ? "chest-open" : "chest";
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
                            if (player.keys[i] === this.requires) {
                                this.state = "open";
                                this.tex = "chest-open";
                            }
                        }
                    }
                }
            }
        });

        return Chest;
    });