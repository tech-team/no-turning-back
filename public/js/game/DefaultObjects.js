define([
    'classy',
    'underscore'
],
    function(Class, _) {
        var DefaultObjects = Class.$extend({
            __classvars__: {
                build: function(type, params) {
                    var data = _.clone(DefaultObjects.object);

                    var typeData = DefaultObjects[type];
                    for (var field in typeData) {
                        data[field] = typeData[field];
                    }

                    for (var field in params) {
                        data[field] = params[field];
                    }

                    return data;
                },

                level: {
                    type: "background",
                    tex: "ground",
                    name: "Default level",
                    width: 1280,
                    height: 768,
                    draggable: false,

                    player: {},
                    mobs: [],
                    walls: [],
                    doors: [],
                    chests: []
                },

                player: {
                    health: 100,
                    inventory: []
                },

                mob: {
                    name: "Vasja",
                    drops: []
                },

                wall: {
                },

                door: {
                    role: "exit",
                    state: "closed",
                    require: []
                },

                chest: {

                },

                object: {
                    type: "", //will be set in runtime
                    tex: "", //will be set in runtime
                    name: "", //represents undefined value
                    x: 100,
                    y: 100,
                    r: 0,
                    w: "",
                    h: ""
                }
            }
        });

        return DefaultObjects;
    });