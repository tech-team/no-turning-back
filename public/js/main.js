require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        jqueryHotKeys: "lib/jquery.hotkeys",
        underscore: "lib/underscore",
        backbone: "lib/backbone",
        classy: "lib/classy"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'classy': {
            exports: 'Class'
        }
    }
});

define([
    'backbone',
    'router'
], function(Backbone, router) {
    Backbone.history.start();

});
