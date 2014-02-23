define([
    'classy'
],
    function(Class) {

        var LevelManager = Class.$extend({
            __init__: function() {

            },

            __classvars__: {
                ObjectType: {
                    Chest: 0
                }
            },

            getLevel: function(id) {
                //TODO: should load from server via AJAX

                return {
                    width: 10,
                    height: 10,

                    textures: [
                        "res/gfx/tiles/road.png",
                        "res/gfx/tiles/wall.png",
                    ],

                    cells: [
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                    ],

                    player: {
                        x: 100, y: 100, angle: 30
                    },

                    enemies: {

                    },

                    objects: [

                    ],

                    wayPoints: [
                        {x: 11, y: 12}
                    ]
                }
            }
        });

        return LevelManager;
    })