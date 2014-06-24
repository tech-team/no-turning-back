define([
    'classy',
    'lodash',
    'game/entities/GameObject',
    'game/misc/Messenger',
    'game/misc/Vector'
],
    function(Class, _, GameObject, Messenger, Vector) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.type = "door";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.state = ( obj.state === "open" ) ? Door.State.Open : Door.State.Closed;
                this.tex = obj.tex;
                this.activationRadius = 90; // TODO: Deprecated
                this.requires = obj.requires;
                this.requiresMessage = undefined;
                this.role = obj.role || null;
                this.puzzle = obj.puzzle || null;
                this.inputCode = "";
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Open: 1
                },
                ActivationRadius: 90
            },

            update: function(event, player, zombiesLeft) {
                var self = this;
                if (this.state === Door.State.Closed) {
                    this.requiresMessage = null;

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
                        self.state = Door.State.Open;
                        self.tex = "door-open";
                    }

                    else if (player.messageCooldown <= 0) {
                        player.messageCooldown = 100;
                    }
                }
            }
        });

        return Door;
    });
