define([
    'classy',
    'game/GameObject'
],
    function(Class, GameObject) {
        var Door = GameObject.$extend({
            __init__: function(obj) {
                this.state = ( obj.state === "open" ) ? Door.State.Open : Door.State.Closed ;
            },

            __classvars__: {
                State: {
                    Closed: 0,
                    Open: 1
                }
            },

            update: function(event) {

            }
        });

        return Door;
    });
