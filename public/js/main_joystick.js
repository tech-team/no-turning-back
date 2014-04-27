require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        backbone: "lib/backbone",
        classy: "lib/classy",
        easel: "lib/game/easeljs",
        Connector: "lib/Connector",
        FnQuery: "lib/FnQuery",
        'socket.io': "/socket.io/socket.io",
        hammer: "lib/hammer",
        move: "lib/move",
        device_normalizer: "lib/deviceapi-normaliser"
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
        },
        'classy': {
            exports: 'Class'
        },
        'easel': {
            exports: 'createjs'
        },
        'hammer': {
            exports: 'hammer'
        },
        'move': {
            exports: 'move'
        },
        'device_normalizer': {
            exports: 'device_normalizer'
        }
    }
});


define([
    'jquery',
    'move',
    'hammer',
    'device_normalizer',
    'joystick/joystick',
    'joystick/Controller'
], function($, move, Hammer, device_normalizer, Joystick, Controller) {
    var inputs = $('.inputs');
    var canvasHolder = $('.canvasHolder');
    var inputField = document.getElementById('token');
    var message = document.getElementById('message');
    var test = document.getElementById('test');

    function getOrientation() {
        return window.orientation % 180 === 0 ? "portrait" : "landscape";
    }

    function checkOrientation() {
        if (getOrientation() === "portrait") {
            console.log("change orientation");
        }

        window.server.send({
            type: "orientation",
            orientation: getOrientation()
        });
    }

    function main() {
        inputs.hide();
        canvasHolder.show();
        mo.init();

        var controller = new Controller($(window), $('canvas')[0]);
        //window.server.send({test: "testFromJoystick"});

        window.addEventListener("deviceorientation", function(e) {
            var orientation = deviceOrientation(e);
            test.innerHTML = "alpha: " + orientation.alpha + "<br />";
            test.innerHTML += "gamma: " + orientation.gamma + "<br />";
            test.innerHTML += "beta: " + orientation.beta + "<br />";
            test.innerHTML += "orientation: " + window.orientation + "<br />";
        }, false);

        window.addEventListener("orientationchange", function(e) {
            e.preventDefault();
            checkOrientation();
            controller.forceUpdate();
        }, false);

        checkOrientation();
    }

    //TODO: somebody should call it
    main();

    function onMessage(data) {
        console.log('message', data);
    }

    function onStatusChanged(status) {
        message.innerHTML = status;
        switch(status) {
            case 'ready':
                break;
            case 'game':
                break;
            default:
                break;
        }
    }

    Joystick(inputField, {
        onStart: main,
        onMessage: onMessage,
        onStatusChanged: onStatusChanged
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