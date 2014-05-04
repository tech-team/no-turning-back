define([
    'classy',
    'underscore',
    'game/GameObject'
],
    function(Class, _, GameObject) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.type = "door";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.state = ( obj.state === "open" ) ? "open" : "closed" ;
                this.tex = obj.tex;
                this.activationRadius = 100;
                this.requires = obj.requires;
                this.requiresMessage = "";
                this.role = obj.role || null;
                this.puzzle = obj.puzzle || null;
                this.inputCode = "";
                this.justOpened = false;
                this.justTried = false;
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Open: 1
                }
            },

            update: function(event, player, zombiesLeft) {
                var self = this;
                var vectorToPlayer = {
                    x: player.dispObj.x - this.dispObj.x,
                    y: player.dispObj.y - this.dispObj.y,
                    distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                };

                if (vectorToPlayer.distance() <= this.activationRadius) {
                    if (this.state === "closed") {
                        this.requiresMessage = "";

                        if(_.isArray(this.requires)) {
                            _.each(this.requires, function(requirement) {
                                if (self.requiresMessage === "") {
                                    if (requirement === "kill_all") {
                                        if (zombiesLeft !== 0) {
                                            self.requiresMessage = "Kill all zombies first.";
                                        }
                                    }
                                    else if(requirement === "puzzle") {
                                        self.requiresMessage = "This door should be opened from somewhere else.";
                                    }
                                    else if(!(_.contains(player.keys, requirement))) {
                                        self.requiresMessage = requirement + " required.";
                                    }
                                }
                            });
                        }
                        else {
                            if (this.requiresMessage === "") {
                                if (this.requires === "kill_all") {
                                    if (zombiesLeft !== 0) {
                                        this.requiresMessage = "Kill all zombies first.";
                                    }
                                }
                                else if(this.requires === "puzzle") {
                                    this.requiresMessage = "This door should be opened from somewhere else.";
                                }
                                else if(!_.contains(player.keys, this.requires)) {
                                    this.requiresMessage = this.requires + " required.";
                                }
                            }
                        }

                        if (!this.requiresMessage) {
                            self.justOpened = true;
                            self.state = "open";
                            self.tex = "door-open";
                        }

                        else if (player.messageCooldown <= 0) {
                            this.justTried = true;
                            player.messageCooldown = 100;
                        }
                    }
                }
            }
        });

        return Door;
    });
