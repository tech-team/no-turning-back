define([
    'lodash',
    'game/entities/GameObject'
],
    function(_, GameObject) {
        var Chest = GameObject.$extend({
            __init__: function(dispObj) {
                this.$super(dispObj);

                this.requiresMessage = null;
            },

            __classvars__: {
                State: {
                    Closed: "closed",
                    Open: "open"
                },
                Tex: {
                    Closed: "chest",
                    Open: "chest-open"
                },
                ActivationRadius: 50
            },

            storage: function() {
                return this.dispObj.data.storage;
            },

            clearStorage: function() {
                this.dispObj.data.storage = [];
            },

            _state: function() {
                return this.dispObj.data.state;
            },

            isClosed: function() {
                return this._state() == Chest.State.Closed;
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



            update: function(event, player) {
                if (!this.isClosed()) return;

                var self = this;
                this.requiresMessage = "";
                if (this.requires()) {
                    if(_.isArray(this.requires())) {
                        _.each(this.requires(), function(requirement) {
                            if (self.requiresMessage === "" && !(_.contains(player.keys, requirement))) {
                                self.requiresMessage = requirement;
                            }
                        });
                    }
                    else if(!_.contains(player.keys(), this.requires())) {
                        this.requiresMessage = this.requires();
                    }
                }

                if (!this.requiresMessage) {
                    this.setState(Chest.State.Open);
                    this.setTex(Chest.Tex.Open);
                } else if (player.messageCooldown <= 0) {
                    player.messageCooldown = 100;
                }
            }
        });

        return Chest;
    });