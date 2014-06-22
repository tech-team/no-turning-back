define([
    'classy',
    'underscore',
    'game/entities/GameObject'
],
    function(Class, _, GameObject) {
        var Chest = GameObject.$extend({
            __init__: function(obj) {
                this.type = "chest";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.storage = obj.storage;
                this.state = ( obj.state === "open" ) ? Chest.State.Open : Chest.State.Closed ;
                this.requires = obj.requires;
                this.requiresMessage = "";
                this.activationRadius = 50;
                this.tex = ( this.state === Chest.State.Open) ? "chest-open" : "chest";
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
                    if (this.state === Chest.State.Closed) {
                        this.requiresMessage = "";

                        if (this.requires) {
                            if(_.isArray(this.requires)) {
                                _.each(this.requires, function(requirement) {
                                    if (self.requiresMessage === "" && !(_.contains(player.keys, requirement))) {
                                        self.requiresMessage = requirement;
                                    }
                                });
                            }
                            else if(!_.contains(player.keys, this.requires)) {
                                this.requiresMessage = this.requires;
                            }
                        }

                        if (!this.requiresMessage) {
                            this.state = Chest.State.Open ;
                            this.tex = "chest-open";
                        }
                        else if (player.messageCooldown <= 0) {
                            player.messageCooldown = 100;
                        }
                    }
                }
            }
        });

        return Chest;
    });