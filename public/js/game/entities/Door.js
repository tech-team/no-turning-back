define([
    'classy',
    'lodash',
    'game/entities/GameObject',
    'game/misc/Messenger'
],
    function(Class, _, GameObject, Messenger) {
        var Door = GameObject.$extend({
            __init__: function(objectData, dispObj) {
                this.$super(objectData, dispObj);

                this.requiresMessage = null;
                this.inputCode = ""; // TODO: need to do smth with this...
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

            data: function() {
                this._data.x = this.dispObj.x;
                this._data.y = this.dispObj.y;
                this._data.rotation = this.dispObj.rotation;
            },

            _state: function() {
                return this._data.state;
            },

            isClosed: function() {
                return this._state() == Door.State.Closed;
            },

            setState: function(newState) {
                this._data.state = newState;
            },

            requires: function() {
                return this._data.requires;
            },

            tex: function() {
                return this._data.tex;
            },

            setTex: function(newTex) {
                this._data.tex = newTex;
            },

            role: function() {
                return this._data.role;
            },

            puzzle: function() {
                return this._data.puzzle;
            },



            update: function(event, player, zombiesLeft) {
                if (!this.isClosed()) return;

                var self = this;
                this.requiresMessage = "";

                var testRequirement = function(requirement) {
                    if (!self.requiresMessage) {
                        if (requirement === "kill_all") {
//                                if (zombiesLeft !== 0)
//                                    self.requiresMessage = Messenger.doorLockedKillAll;
                        }
                        else if(requirement === "puzzle") {
                            self.requiresMessage = Messenger.doorLockedPuzzle;
                        }
                        else if(!(_.contains(player.keys, requirement))) {
                            self.requiresMessage = Messenger.prepareMessage(Messenger.doorLocked, requirement)
                        }
                    }
                };

                if(_.isArray(this.requires()))
                    _.each(this.requires(), testRequirement);
                else
                    testRequirement(this.requires());

                if (!this.requiresMessage) {
                    self.setState(Door.State.Open);
                    self.setTex(Door.Tex.Open);
                }

                else if (player.messageCooldown <= 0) {
                    player.messageCooldown = 100;
                }
            }
        });

        return Door;
    });
