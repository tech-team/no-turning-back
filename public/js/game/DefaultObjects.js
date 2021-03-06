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
                    chests: [],
                    decorations: [],
                    puzzles: []
                },

                player: {
                    tex: "player-knife",
                    health: 100,
                    armor: 0,
                    inventory: [],
                    keys: []
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
                    puzzleName: "",
                    role: "",
                    state: "closed",
                    requires: []
                },

                chest: {
                    state: "closed",
                    requires: [],
                    storage: []
                },

                puzzle: {
                    name: "puzzle1",
                    code: ""
                },

                button: {
                    value: "",
                    state: "released"
                },

                waypoint: {

                },

                medkit: {
                    size: 25
                },

                armor: {
                    size: 30
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

                decoration: {

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