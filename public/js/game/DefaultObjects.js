define([
    'classy',
    'lodash'
],
    function(Class, _) {
        var DefaultObjects = Class.$extend({
            __classvars__: {
                build: function(type, params) {
                    var objectData = _.cloneDeep(DefaultObjects.object);
                    var typeData = _.cloneDeep(DefaultObjects[type]);
                    var paramsData = _.cloneDeep(params);

                    var data = _.extend(_.extend(objectData, typeData), paramsData);

                    data.type = type;

                    if (data.tex == "object")
                        data.tex = type;

                    return data;
                },

                level: {
                    type: "background",
                    tex: "ground",
                    name: "Default level",
                    campaign: "Workshop",
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
                    inventory: [],
                    keys: [],
                    weapons: {"knife": -1}
                },

                zombie: {
                    health: 20,
                    speed: 2,
                    followDistance: 150,
                    weapon: "",
                    drops: [],
                    waypoints: []
                },

                wall: {
                },

                door: {
                    puzzle: "",
                    role: "",
                    state: "closed",
                    requires: []
                },

                chest: {
                    requires: [],
                    storage: []
                },

                button: {
                    puzzle: "",
                    value: ""
                },

                waypoint: {

                },

                medkit: {
                    size: 25
                },

                key: {
                    name: "golden key"
                },

                ammo: {
                    weapon: "pistol",
                    size: 0
                },

                weapon: {
                   ammo: 5
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