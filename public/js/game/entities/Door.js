define([
    'classy',
    'underscore',
    'game/entities/GameObject',
    'game/misc/Messenger'
],
    function(Class, _, GameObject, Messenger) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.type = "door";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.state = ( obj.state === "open" ) ? "open" : "closed" ;
                this.tex = obj.tex;
                this.activationRadius = 90;
                this.requires = obj.requires;
                this.requiresMessage = undefined;
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
                        this.requiresMessage = undefined;

                        var testRequirement = function(requirement) {
                            if (!self.requiresMessage) {
                                if (requirement === "kill_all") {
                                    if (zombiesLeft !== 0)
                                        self.requiresMessage = Messenger.doorLockedKillAll;
                                }
                                else if(requirement === "puzzle") {
                                    self.requiresMessage = Messenger.doorLockedPuzzle;
                                }
                                else if(!(_.contains(player.keys, requirement))) {
                                    self.requiresMessage = Messenger.prepareMessage(Messenger.doorLocked, requirement)
                                }
                            }
                        };

                        if(_.isArray(this.requires))
                            _.each(this.requires, testRequirement);
                        else
                            testRequirement(this.requires);

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
