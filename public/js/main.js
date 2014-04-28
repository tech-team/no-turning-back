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
        "socket.io": "/socket.io/socket.io",
        modernizr: "lib/modernizr"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
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

        "socket.io": {
            exports: "io"
        },
        'modernizr': {
            exports: 'modernizr'
        }
    }
});

define([
    'backbone',
    'router'
], function(Backbone, router) {
    Backbone.history.start();

});