require.config({
    urlArgs: "_=", //+ (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
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
        'device_normalizer': {
            exports: 'device_normalizer'
        }
    }
});


define([
    'jquery',
    'utils/BrowserCheck',
    'device_normalizer',
    'joystick/joystick',
    'joystick/Controller',
    'easel',
    'utils/Message'
], function($, checker, device_normalizer, Joystick, Controller, createjs, Message) {
    var inputs = $('.inputs');
    var canvasHolder = $('.canvasHolder');
    var inputField = document.getElementById('token');
    var message = document.getElementById('message');
    var $tokenForm = $('#tokenForm');
    var isReconnecting = false;
    
    var messenger = new Message();


    /******************************** util functions ********************************/

    function hideJoystick() {
        canvasHolder.hide();
        inputs.show();
    }

    function showJoystick() {
        inputs.hide();
        canvasHolder.show();
    }

    function getOrientation() {
        return window.orientation % 180 === 0 ? "portrait" : "landscape";
    }

    function checkOrientation() {
        if (getOrientation() === "portrait") {
            messenger.showMessage("Change device orientation to landscape", true);
            window.serverSend({
                type: "orientation",
                orientation: getOrientation()
            });
        }
        else {
            messenger.hideMessage();
        }
    }

    function checkBrowserSupport() {
        if (!checker.browserSupport() || !checker.touchSupport()) {
            messenger.showMessage("Your browser is not supported. Sorry", true);
        }
    }

    function startJoystick() {
        Joystick(inputField, {
            onStart: joystickMain,
            onMessage: onMessage,
            onStatusChanged: onStatusChanged,
            onDisconnect: onDisconnect
        });
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

        $('#token').on('keyup', function(){
            this.value = this.value.toLocaleUpperCase();
        });

        checkOrientation();
        startJoystick();
    }
    main();

    /******************************** joystick stuff ********************************/

    function disconnect(sendToClient) {
        localStorage.removeItem('playerguid');
        if (sendToClient) {
            window.serverSend({
                type: "disconnect"
            });
        }
        window.server.disconnect();
    }

    function joystickMain() {
        showJoystick();

        var controller = new Controller($(window), $('canvas')[0], function() {
            disconnect(true);
            startJoystick();
        }.bind(window));

        window.removeEventListener("orientationchange");
        window.addEventListener("orientationchange", function (e) {
            checkOrientation();
            controller.forceUpdate();
        }, false);

        window.addEventListener("deviceorientation", controller.onGyro.bind(controller), false);
        checkOrientation();
    }



    function onMessage(data) {
        switch (data.type) {
            case "info":
                if (data.action === "gamefinished") {
                    messenger.showMessage(data.message, false);
                }
                else if (data.action === "gameStateChanged") {
                    if (data.arg === "pause")
                        messenger.showMessage("Game paused", true);
                    else if (data.arg === "play")
                        messenger.hideMessage();
                }
                break;
            case "disconnect":
                disconnect();
                break;
        }
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
        messenger.showMessage("You were disconnected", false, function() {
            location.reload();
        });

    }



});