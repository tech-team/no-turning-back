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
    var $message = $('.message');
    var $messageText = $message.find('.message__textbox__text');
    var $messageDimmer = $('.message-dimmer');

    window.scrollTo(0,1);

    function toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
    }
    //toggleFullScreen(); // TODO: not working


    function hideJoystick() {
        canvasHolder.hide();
        inputs.show();
    }

    function showJoystick() {
        inputs.hide();
        canvasHolder.show();
    }


    function onMessageEvents(callback) {
        $messageDimmer.on('click', function () {
            hideMessage();
            if (callback)
                callback();
        });

        $message.on('click', function () {
            hideMessage();
            if (callback)
                callback();
        });
    }

    function offMessageEvents() {
        $messageDimmer.off('click');
        $message.off('click');
    }


    function showMessage(messageText, disallowHide, callback) {
        if (disallowHide)
            offMessageEvents();
        else
            onMessageEvents(callback);
        $messageText.text(messageText);
        $messageDimmer.show();
        $message.show();
    }

    function hideMessage() {
        $message.hide();
        $messageDimmer.hide();
    }

    function getOrientation() {
        return window.orientation % 180 === 0 ? "portrait" : "landscape";
    }

    function checkOrientation() {
        if (getOrientation() === "portrait") {
            console.log("change orientation");
            showMessage("Change device orientation to landscape", true);
        }
        else {
            hideMessage();
        }

        window.server.send({
            type: "orientation",
            orientation: getOrientation()
        });
    }

    function main() {
        setTimeout(function(){
            // Hide the address bar!
            window.scrollTo(0, 1);
        }, 0);
        showJoystick();
        mo.init();

        var controller = new Controller($(window), $('canvas')[0]);
        //window.server.send({test: "testFromJoystick"});

        window.addEventListener("deviceorientation", function (e) {
            var orientation = deviceOrientation(e);
            test.innerHTML = "alpha: " + orientation.alpha + "<br />";
            test.innerHTML += "gamma: " + orientation.gamma + "<br />";
            test.innerHTML += "beta: " + orientation.beta + "<br />";
            test.innerHTML += "orientation: " + window.orientation + "<br />";
        }, false);

        window.addEventListener("orientationchange", function (e) {
            e.preventDefault();
            checkOrientation();
            controller.forceUpdate();
        }, false);

        checkOrientation();
    }

    //main();

    function onMessage(data) {
        console.log('message', data);
    }

    function onStatusChanged(status) {
        message.innerHTML = status;
        switch (status) {
            case 'ready':
                break;
            case 'game':
                break;
            default:
                break;
        }
    }

    function onDisconnect() {
        showMessage("You were disconnected", false, function() {
            hideJoystick();
        });

    }

    Joystick(inputField, {
        onStart: main,
        onMessage: onMessage,
        onStatusChanged: onStatusChanged,
        onDisconnect: onDisconnect
    });

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
//            "-webkit-transform": tran