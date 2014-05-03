define([
    'classy',
    'underscore',
    'game/GameObject'
],
    function(Class, _, GameObject) {
        var Button = GameObject.$extend({
            __init__: function(obj) {
                this.type = "button";
                this.x = obj.x;
                this.y = obj.y;
                this.r = obj.r;
                this.role = obj.role;
                this.value = obj.value;
                this.state = "depressed";
                this.tex = obj.tex;
                this.activationRadius = 70;
                this.justPressed = false;
            },

            update: function(event, player) {
                var vectorToPlayer = {
                    x: player.dispObj.x - this.dispObj.x,
                    y: player.dispObj.y - this.dispObj.y,
                    distance: function() { return Math.sqrt(this.x*this.x + this.y*this.y); }
                };

                if (vectorToPlayer.distance() <= this.activationRadius && this.state === "depressed") {
                    this.justPressed = true;
                    this.state = "pressed";
                    this.tex = "button_pressed";
                }
            }
        });

        return Button;
     });