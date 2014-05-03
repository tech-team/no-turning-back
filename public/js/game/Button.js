define([
    'classy',
    'underscore',
    'game/GameObject'
],
    function(Class, _, GameObject) {
        var Button = GameObject.$extend({
            __init__: function(obj) {
                this.role = obj.role;
                this.value = obj.value;
                this.state = "depressed";
                this.activationRadius = 70;
            },

            update: function(event, player) {

            }
        });

        return Button;
     });