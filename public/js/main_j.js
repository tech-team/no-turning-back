require.config({
    urlArgs: "_=", //+ (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        lodash: "lib/lodash",
        backbone: "lib/backbone",
        classy: "lib/classy",
        easel: "lib/game/easeljs",
        Connector: "lib/Connector",
        FnQuery: "lib/FnQuery",
        'socket.io': "lib/socket.io",
        device_normalizer: "lib/deviceapi-normaliser",
        modernizr: "lib/modernizr"
    },
    shim: {
        'backbone': {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
        'lodash': {
            exports: '_'
        },
        'socket.io': {
            exports: 'io'
        },
        'classy': {
            exports: 'Class'
        },
        'easel': {
            exports: 'createjs'
        },
        'device_normalizer': {
            exports: 'device_normalizer'
        }
    }
});

define([
    'backbone',
    'router_j',
    'utils/BuiltinTypesUtils'
], function(Backbone, router_j, BuiltinTypesUtils) {
    Backbone.history.start();
    BuiltinTypesUtils();
    window.J_DEBUG = true;
});