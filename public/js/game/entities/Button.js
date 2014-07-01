define([
    'lodash',
    'game/entities/GameObject'
],
    function(_, GameObject) {
        var Button = GameObject.$extend({
            __init__: function(dispObj, puzzle) {
                this.$super(dispObj);

                this._puzzle = puzzle;
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

            pressButton: function() {
                this.setState(Button.State.Pressed);
                this.setTex(Button.Tex.Pressed);
            },
            releaseButton: function() {
                this.setState(Button.State.Released);
                this.setTex(Button.Tex.Released);
            },


            update: function() {
                if (this.isReleased()) {
                    this.pressButton();

                    if (this._puzzle.isSolved())
                        return null;

                    return this._puzzle.update(this.value());
                }
                return null;
            }
        });

        return Button;
     });