define([
    'lodash',
    'game/entities/GameObject',
    'game/misc/Messenger'
],
    function(_, GameObject, Messenger) {
        var Door = GameObject.$extend({
            __init__: function(dispObj) {
                this.$super(dispObj);

                this.requiresMessage = null;
                this.puzzleSolvedStatus = false;
            },

            __classvars__: {
                State: {
                    Closed: "closed",
                    Open: "open"
                },

                Tex: {
                    Closed: "door-closed",
                    Open: "door-open"
                },

                ActivationRadius: 90
            },

            _state: function() {
                return this.dispObj.data.state;
            },

            isClosed: function() {
                return this._state() == Door.State.Closed;
            },

            setState: function(newState) {
                this.dispObj.data.state = newState;
            },

            requires: function() {
                return this.dispObj.data.requires;
            },

            tex: function() {
                return this.dispObj.data.tex;
            },

            setTex: function(newTex) {
                this.dispObj.data.tex = newTex;
            },

            role: function() {
                return this.dispObj.data.role;
            },

            puzzleName: function() {
                return this.dispObj.data.puzzleName;
            },

            setPuzzleSolved: function() {
                this.puzzleSolvedStatus = true;
            },

            isPuzzleSolved: function() {
                return this.puzzleSolvedStatus;
            },


            openDoor: function() {
                this.setState(Door.State.Open);
                this.setTex(Door.Tex.Open);
            },

            update: function(event, player, zombiesLeft) {
                if (!this.isClosed()) return;

                var self = this;
                this.requiresMessage = "";

                var testRequirement = function(requirement) {
                    if (!self.requiresMessage) {
                        if (requirement === "kill_all") {
                            if (zombiesLeft !== 0)
                                self.requiresMessage = Messenger.doorLockedKillAll;
                        }
                        else if(requirement === "puzzle") {
                            if (!self.isPuzzleSolved()) {
                                self.requiresMessage = Messenger.doorLockedPuzzle;
                            }
                        }
                        else if(!(_.contains(player.keys(), requirement))) {
                            self.requiresMessage = Messenger.prepareMessage(Messenger.doorLocked, requirement)
                        }
                    }
                };

                if(_.isArray(this.requires()))
                    _.each(this.requires(), testRequirement);
                else
                    testRequirement(this.requires());

                if (!this.requiresMessage) {
                    this.openDoor();
                }

                else if (player.messageCooldown <= 0) {
                    player.messageCooldown = 100;
                }
            }
        });

        return Door;
    });
