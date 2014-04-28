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
        device_normalizer: "lib/deviceapi-normaliser",
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
        },
        'modernizr': {
            exports: 'modernizr'
        }
    }
});


define([
    'jquery',
    'modernizr',
    'device_normalizer',
    'joystick/joystick',
    'joystick/Controller',
    'easel'
], function($, modernizr, device_normalizer, Joystick, Controller, createjs) {
    var inputs = $('.inputs');
    var canvasHolder = $('.canvasHolder');
    var inputField = document.getElementById('token');
    var message = document.getElementById('message');
    var test = document.getElementById('test');
    var $message = $('.message');
    var $messageText = $message.find('.message__textbox__text');
    var $messageDimmer = $('.message-dimmer');


    /******************************** util functions ********************************/

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

        window.serverSend({
            type: "orientation",
            orientation: getOrientation()
        });
    }

    function checkBrowserSupport() {
        console.log(Modernizr);
        console.log(createjs.Touch.isSupported());
        if (!Modernizr.canvas || !Modernizr.canvastext || !Modernizr.localstorage
            || !Modernizr.audio || !Modernizr.multiplebgs
            || !Modernizr.csstransforms || !Modernizr.fontface || !createjs.Touch.isSupported()) {
            showMessage("Your browser is not supported. Sorry", true);
        }
    }


    /******************************** main ********************************/

    function main() {
        window.scrollTo(0,1);
        mo.init();

        checkBrowserSupport();

        window.serverSend = function(objectToSend) {
            if (window.server) {
                window.server.send(objectToSend);
            }
        };

        window.addEventListener("orientationchange", function (e) {
            checkOrientation();
        }, false);

        checkOrientation();

        //joystickMain();

        Joystick(inputField, {
            onStart: joystickMain,
            onMessage: onMessage,
            onStatusChanged: onStatusChanged,
            onDisconnect: onDisconnect
        });
    }
    main();


    /******************************** joystick stuff ********************************/


    function joystickMain() {
        showJoystick();

        var controller = new Controller($(window), $('canvas')[0]);

        window.addEventListener("deviceorientation", function (e) {
            var orientation = deviceOrientation(e);
            test.innerHTML = "alpha: " + orientation.alpha + "<br />";
            test.innerHTML += "gamma: " + orientation.gamma + "<br />";
            test.innerHTML += "beta: " + orientation.beta + "<br />";
            test.innerHTML += "orientation: " + window.orientation + "<br />";
        }, false);

        window.removeEventListener("orientationchange");
        window.addEventListener("orientationchange", function (e) {
            checkOrientation();
            controller.forceUpdate();
        }, false);
        checkOrientation();
    }



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



});