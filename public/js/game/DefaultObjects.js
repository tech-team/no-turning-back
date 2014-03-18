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

                    data.type = type;
                    data.tex = type;

                    return data;
                },

                level: {
                    type: "background",
                    tex: "ground",
                    name: "Default level",
                    x: 0,
                    y: 0,
                    w: 1280,
                    h: 768,
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
                    type: "object",
                    tex: "object",
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