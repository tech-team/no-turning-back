require.config({
    urlArgs: "_=",// + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        lodash: "lib/lodash",
        backbone: "lib/backbone",
        classy: "lib/classy",
        easel: "lib/game/easeljs",
        preload: "lib/game/preloadjs",
        sound: "lib/game/soundjs",
        tween: "lib/game/tweenjs",
        collision: "lib/game/collision",
        Connector: "lib/Connector",
        FnQuery: "lib/FnQuery",
        "socket.io": "lib/socket.io",
        modernizr: "lib/modernizr",
        alertify: "lib/alertify",
        signals: "lib/signals"
    },
    shim: {
        'backbone': {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'lodash': {
            exports: '_'
        },
        'classy': {
            exports: 'Class'
        },
        'easel': {
            exports: 'createjs'
        },
        'preload': {
            exports: 'createjs'
        },
        'sound': {
            exports: 'createjs'
        },
        'tween': {
            deps: ['easel'],
            exports: 'tweenjs'
        },
        'collision': {
            exports: 'ndgmr'
        },
        'socket.io': {
            exports: 'io'
        }
    }
});

define([
    'backbone',
    'router',
    'utils/BuiltinTypesUtils'
], function(Backbone, router, BuiltinTypesUtils) {
    Backbone.history.start();
    BuiltinTypesUtils();
});