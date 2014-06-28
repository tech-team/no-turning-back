define([
    'classy',
    'lodash',
    'game/entities/GameObject',
    'game/misc/KeyCoder',
    'game/misc/Messenger',
    'game/misc/Vector'
],
    function(Class, _, GameObject, KeyCoder, Messenger, Vector) {
        var Button = GameObject.$extend({
            __init__: function(dispObj, doors) {
                this.$super(dispObj);

                this.targetDoors = [];
                _.each(doors, function(door) {
                    if (door.puzzle() && door.puzzle().name == this.puzzle() && door.isClosed()) {
                        this.targetDoors.push(door);
                    }
                }.bind(this));

                this.puzzleSolvedStatus = null;
            },

            __classvars__: {
                State: {
                    Pressed: "pressed",
                    Released: "released"
                },
                Tex: {
                    Pressed: "button_pressed",
                    Released: "button"
                },
                ActivationRadius: 30
            },

            targets: function() {
                return this.targetDoors;
            },

            state: function() {
                return this.dispObj.data.state;
            },

            isPressed: function() {
                return this.state() == Button.State.Pressed;
            },

            isReleased: function() {
                return this.state() == Button.State.Released;
            },

            setState: function(newState) {
                this.dispObj.data.state = newState;
            },

            tex: function() {
                return this.dispObj.data.tex;
            },

            setTex: function(newTex) {
                this.dispObj.data.tex = newTex;
            },

            value: function() {
                return this.dispObj.data.value;
            },

            puzzle: function() {
                return this.dispObj.data.puzzle;
            },

            pressButton: function() {
                this.setState(Button.State.Pressed);
                this.setTex(Button.Tex.Pressed);
            },
            releaseButton: function() {
                this.setState(Button.State.Released);
                this.setTex(Button.Tex.Released);
            },


            update: function(event, player, doors) {
                if (this.isReleased()) {
                    this.pressButton();

                    if (this.puzzleSolvedStatus === true)
                        return null;

                    var self = this;
                    _.each(this.targetDoors, function(door) {
                        door.inputCode += self.value();
                        if (door.inputCode.length >= door.puzzle().code.length) {
                            if (door.puzzleSolved()) {
                                self.puzzleSolvedStatus = true;
                            } else {
                                self.puzzleSolvedStatus = false;
                                door.inputCode = "";
                            }

                        }
                    });
                    return self.puzzleSolvedStatus;
                }
                return null;
            }
        });

        return Button;
     });