define([
    'classy',
    'underscore',
    'game/GameObject',
    'game/KeyCoder'
],
    function(Class, _, GameObject, KeyCoder) {
        var Button = GameObject.$extend({
            __init__: function(obj) {
                this.type = "button";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.role = obj.role;
                this.puzzle = obj.puzzle;
                this.value = obj.value;
                this.state = "depressed";
                this.tex = obj.tex;
                this.activationRadius = 40;
                this.justPressed = false;
                this.justDepressed = false;

                this.message = "";
                this.pressCooldown = 0;
            },

            update: function(event, player, doors) {
                var vectorToPlayer = {
                    x: player.dispObj.x - this.dispObj.x,
                    y: player.dispObj.y - this.dispObj.y,
                    distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                };

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
                                        this.message = "Puzzle solved!";
                                    }
                                    else {
                                        this.message = "Solution is incorrect";
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