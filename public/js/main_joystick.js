require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        backbone: "lib/backbone",
        Connector: "lib/Connector",
        FnQuery: "lib/FnQuery",
        'socket.io': "/socket.io/socket.io",
        hammer: "lib/hammer",
        move: "lib/move"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'socket.io': {
            exports: 'io'
        }
    }
});


define([
    'jquery',
    'move',
    'hammer',
    'joystick/joystick'
], function($, move, Hammer, Joystick) {
    function main() {
//        window.server.send({test: "testFromJoystick"});
    }

    function onMessage(data) {
        console.log('message', data);
    }

    Joystick({
        onStart: main,
        onMessage: onMessage
    });

// TODO: supposed to be in main()
//    move.defults = {
//        duration: 0
//    };
//
//    var circle = $('.circle');
//    var small_circle = $('.inner-circle');
//
//    var lastPosX = small_circle.position().left,
//        lastPosY = small_circle.position().top;
//    var posX = 0,
//        posY = 0;
//
//    var hammertime = Hammer(small_circle[0], {
//        transform_always_block: true,
//        transform_min_scale: 1,
//        drag_block_horizontal: true,
//        drag_block_vertical: true,
//        drag_min_distance: 0
//    });
//
//
//    hammertime.on("drag", function(event) {
//        var gesture = event.gesture;
//        posX = lastPosX + gesture.deltaX;
//        posY = lastPosY + gesture.deltaY;
////        move('.inner-circle')
////            .to(posX, posY)
////            .end();
//
//        var transform = "translate(" + posX + "px," + posY +" px)";
//
////        var inner = document.getElementById('inner');
////        inner.style.transform = transform;
////        inner.style.oTransform = transform;
////        inner.style.msTransform = transform;
////        inner.style.mozTransform = transform;
////        inner.style.webkitTransform = transform;
//
//        $('#inner').css({
//            "-webkit-transform": transform
//        });
//    });
//
//    hammertime.on("dragend", function(event) {
//        var gesture = event.gesture;
//        lastPosX = posX;
//        lastPosY = posY;
//
//    });
});