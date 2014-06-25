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
            __init__: function(obj) {
                this.type = "button";
                this.role = obj.role;
                this.puzzle = obj.puzzle;
                this.value = obj.value;
                this.state = "depressed";
                this.tex = obj.tex;
                this.activationRadius = 30;
                this.justPressed = false;
                this.justDepressed = false;

                this.message = undefined;
                this.pressCooldown = 0;
            },

            __classvars__: {

            },

            update: function(event, player, doors) {
                var vectorToPlayer = new Vector({
                    x: player.x() - this.x(),
                    y: player.y() - this.y()
                });

                if (event.keys[KeyCoder.E]) {
                    if (vectorToPlayer.distance() <= this.activationRadius && this.state === "depressed") {
                        this.justPressed = true;
                        this.state = "pressed";
                        this.tex = "button_pressed";
                        this.pressCooldown = 50;


                        for (var i = 0; i < doors.length; ++i) {
                            if (doors[i].puzzle && doors[i].puzzle["name"] === this.puzzle && doors[i].state === "closed") {
                                doors[i].inputCode += this.value;
                                if (doors[i].inputCode.length >= doors[i].puzzle["code"].length) {
                                    if (doors[i].inputCode === doors[i].puzzle["code"]) {
                                        doors[i].justOpened = true;
                                        doors[i].state = "open";
                                        doors[i].tex = "door-open";
                                        this.message = Messenger.puzzleSolved;
                                    }
                                    else {
                                        this.message = Messenger.puzzleFailed;
                                    }
                                    doors[i].inputCode = "";
                                }
                            }
                        }
                    }
                }

                if (this.state === "pressed" && this.pressCooldown === 0) {
                    this.justDepressed = true;
                    this.state = "depressed";
                    this.tex = "button";

                }
                if (this.pressCooldown > 0) {
                    --this.pressCooldown;
                }


            }
        });

        return Button;
     });