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
            __init__: function(dispObj) {
                this.$super(dispObj);


//                this.puzzle = obj.puzzle;
//                this.value = obj.value;
//                this.state = "depressed";
//                this.tex = obj.tex;
                this.justPressed = false;
                this.justDepressed = false;

                this.message = undefined;
                this.pressCooldown = 0;
            },

            __classvars__: {
                State: {
                    Pressed: "pressed",
                    Depressed: "depressed"
                },
                Tex: {
                    Pressed: "button_pressed",
                    Depressed: "button"
                },
                ActivationRadius: 30
            },

            state: function() {
                return this.dispObj.data.state;
            },

            isPressed: function() {
                return this.state() == Button.State.Pressed;
            },

            isDepressed: function() {
                return this.state() == Button.State.Depressed;
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


            update: function(event, player, doors) {
                this.setState(Button.State.Pressed);
                this.setTex(Button.Tex.Pressed);
                this.pressCooldown = 50;

                var self = this;
                var targetDoors = [];
                _.each(doors, function(door) {
                    if (door.puzzle() && door.puzzle().name == self.puzzle && door.isClosed()) {
                        targetDoors.push(door);
                    }
                });

                _.each(targetDoors, function(door) {
                    door.inputCode += self.value();
                    if (door.inputCode.length >= door.puzzle().code.length) {
                        self.message = door.puzzleSolved() ? Messenger.puzzleSolved : Messenger.puzzleFailed;
                        door.inputCode = "";
                    }

                });

                if (this.isPressed() && this.pressCooldown === 0) {
                    this.setState(Button.State.Depressed);
                    this.setTex(Button.Tex.Depressed);
                }

                if (this.pressCooldown > 0) {
                    --this.pressCooldown;
                }


            }
        });

        return Button;
     });