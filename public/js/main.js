require.config({
    //urlArgs: "_=" + (new Date()).getTime(),
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
        collision: "lib/game/collision"
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
            exports: 'soundjs'
        },
        'tween': {
            deps: ['easel'],
            exports: 'tweenjs'
        },
        'collision': {
            exports: 'ndgmr'
        }

    }
});

define([
    'backbone',
    'router'
], function(Backbone, router) {
    Backbone.history.start();

});