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
                        data[field] = _.clone(typeData[field]);
                    }

                    for (var field in params) {
                        data[field] = _.clone(params[field]);
                    }

                    data.type = type;

                    if (data.tex == "object")
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
                    zombies: [],
                    walls: [],
                    doors: [],
                    chests: []
                },

                player: {
                    health: 100,
                    inventory: []
                },

                zombie: {
                    health: 20,
                    speed: 2,
                    drops: [],
                    waypoints: []
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

                waypoint: {

                },

                medkit: {
                    size: 25
                },

                key: {
                    name: "golden_key"
                },

                ammo: {
                    weapon: "pistol",
                    size: 0
                },

                weapon: {
                   name: "pistol",
                   damage: 10,
                   ammo: 10
                },

                corpse: {
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