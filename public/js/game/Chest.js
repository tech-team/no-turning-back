define([
    'classy',
    'game/AliveObject'
],
    function(Class, AliveObject) {
        var Chest = AliveObject.$extend({
            __init__: function() {
                this.storage = [];
                this.state = Chest.State.Closed;
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Opened: 1
                }
            },

            update: function(event) {

            }
        });

        return Player;
    });