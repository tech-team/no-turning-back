define([
    'lodash',
    'classy',
    'Connector'
], function(_, Class, Connector) {
    var CConnector = Class.$extend({
        __init__: function(callbacks) {
            this.callbacksArray = [];
            this.addCallbacks(callbacks);

            // Создаем связь с сервером
            this.server = new Connector({
                    server: ['getToken', 'bind', 'unbind'],
                    remote: '/console'
                }
            );

            this.createServerEvents();
            this.init();
            window.server = this.server;
        },

        applyCallback: function(name) {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 1);

            _.each(this.callbacksArray, function(callbacks) {
                callbacks[name] && callbacks[name].apply(self, args);
            });
        },

        addCallbacks: function(callbacks) {
            callbacks || (callbacks = {});
            callbacks.onStart || (callbacks.onStart = function() {});
            callbacks.onMessage || (callbacks.onMessage = function(data, answer) {});
            callbacks.onStatusChanged || (callbacks.onStatusChanged = function(status) {});
            callbacks.onDisconnect || (callbacks.onDisconnect = function() {});
            callbacks.saveToken || (callbacks.saveToken = function() {});
            callbacks.onForceReconnect || (callbacks.onForceReconnect = function() {});

            this.callbacksArray.push(callbacks);
        },

        createServerEvents: function() {
            this.server.on('reconnect', this.reconnect.bind(this));
            this.server.on('forceReconnect', this.forceReconnect.bind(this));

            var self = this;
            // На подключении игрока стартуем игру
            this.server.on('player-joined', function (data) {
                // Передаем id связки консоль-джостик
                self.start(data.guid);
            });

            // Обмен сообщениями
            this.server.on('message', function (data, answer) {
                if (data.type == '__forceReconnect__') {
                    self.forceReconnect(true);
                    answer && answer()
                } else {
                    self.applyCallback('onMessage', data, answer);
                }
            });

            this.server.on('disconnect', function() {
                localStorage.removeItem('consoleguid');
                window.server = null;
                self.applyCallback('onDisconnect');
            });
        },

        init: function(forceNewToken) {
            var self = this;
            console.log('ready');
            // Если id нет
            if (!localStorage.getItem('consoleguid')) {
                // Получаем токен
                this.server.getToken({forceNewToken: forceNewToken}, function (token) {
                    console.log('token: ' + token);
                    localStorage.setItem('token', token);
                    self.applyCallback('saveToken', token);
                });
            } else { // иначе
                // переподключаемся к уже созданной связке
                this.reconnect();
            }
        },

        start: function(guid) {
            console.log('start console');
            // Сохраняем id связки
            localStorage.setItem('consoleguid', guid);
            this.applyCallback('onStart');
        },

        forceReconnect: function(theirAttempt) {
            var guid = localStorage.getItem('consoleguid');
            if (guid === null) {
                this.init(true);
                return;
            }
            localStorage.removeItem('consoleguid');
            localStorage.removeItem('token');
            this.applyCallback('onForceReconnect', theirAttempt);
            if (!theirAttempt) {
                var self = this;
                self.server && self.server.send({
                    type: '__forceReconnect__'
                }, function() {
                    self.server.unbind({guid: guid}, function(data) {
                        if (data.status == 'success') {
                            console.log('onReconnecting unbind success: ');
                            self.init();
                        } else {
                            console.warn('onReconnecting error: ' + data.status);
                        }
                    });
                });
            } else {
                this.init();
            }
        },

        reconnect: function(guid) {
            var self = this;

            guid || (guid = localStorage.getItem('consoleguid'));

            // Используем сохранненный id связки
            this.server.bind({guid: guid}, function (data) {
                // Если все ок
                if (data.status == 'success') {
                    var prevToken = localStorage.getItem('token');
                    console.log('using prev token: ' + prevToken);
                    prevToken || (prevToken = 'Already connected');
                    self.applyCallback('saveToken', prevToken);
                    // Стартуем
                    self.start(data.guid);
                    // Если связки уже нет
                } else if (data.status == 'undefined guid') {
                    // Начинаем все заново
                    localStorage.removeItem('consoleguid');
                    localStorage.removeItem('token');
                    self.init();
                }
            });
        }


    });

    return CConnector;
//
//    var Console = function(callbacks) {
//        callbacks = callbacks ? callbacks : {};
//        callbacks.onStarted = callbacks.onStarted ? callbacks.onStarted : function(token) {};
//        callbacks.saveToken = callbacks.saveToken ? callbacks.saveToken : function(token) {};
//        callbacks.onMessage = callbacks.onMessage ? callbacks.onMessage : function(data) {};
//        callbacks.onDisconnect = callbacks.onDisconnect ? callbacks.onDisconnect : function() {};
//
//
////        var message = document.getElementById('message');
//        var start, init, reconnect;
//
//        // Создаем связь с сервером
//        var server = new Connector({
//                server: ['getToken', 'bind'],
//                remote: '/console'
//            }
//        );
//
//        // На подключении игрока стартуем игру
//        server.on('player-joined', function (data) {
//            // Передаем id связки консоль-джостик
//            start(data.guid);
//        });
//
//        // Инициализация
//        init = function () {
//            console.log('ready');
//            // Если id нет
//            if (!localStorage.getItem('consoleguid')) {
//                // Получаем токен
//                server.getToken(function (token) {
//                    console.log('token: ' + token);
//                    callbacks.saveToken(token);
//                });
//            } else { // иначе
//                // переподключаемся к уже созданной связке
//                reconnect();
//            }
//        };
//
//        // Переподключение
//        reconnect = function () {
//            // Используем сохранненный id связки
//            server.bind({guid: localStorage.getItem('consoleguid')}, function (data) {
//                // Если все ок
//                if (data.status == 'success') {
//                    callbacks.saveToken("Already connected");
//                    // Стартуем
//                    start(data.guid);
//                    // Если связки уже нет
//                } else if (data.status == 'undefined guid') {
//                    // Начинаем все заново
//                    localStorage.removeItem('consoleguid');
//                    init();
//                }
//            });
//        };
//
//        server.on('reconnect', reconnect);
//
//        // Старт игры
//        start = function (guid) {
//            console.log('start console');
//            // Сохраняем id связки
//            localStorage.setItem('consoleguid', guid);
//            callbacks.onStarted();
//        };
//
//        init();
//
//        // Обмен сообщениями
//        server.on('message', function (data, answer) {
//            callbacks.onMessage(data, answer);
////            answer('answer');
//        });
//
//        server.on('disconnect', callbacks.onDisconnect);
//        window.server = server;
//
//
//    };
//    return Console;
});
