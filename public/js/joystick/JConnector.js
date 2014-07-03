define([
    'lodash',
    'classy',
    'Connector'
], function(_, Class, Connector) {
    var JConnector = Class.$extend({
        __init__: function($tokenForm, $inputField, callbacks) {
            this.$tokenForm = $tokenForm;
            this.$inputField = $inputField;
            this.callbacksArray = [];
            this.addCallbacks(callbacks);

            // Создаем связь с сервером
            this.server = new Connector({
                    server: ['bind'],
                    remote: '/player'
                }
            );

            this.createServerEvents();
            this.init();
            window.server = this.server;
            window.serverSend = function(obj, answer) {
                if (window.server) {
                    window.server.send(obj, answer)
                }
            };
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
            callbacks.onWrongToken || (callbacks.onWrongToken = function() {});
            callbacks.onForceReconnect || (callbacks.onForceReconnect = function(noNotification) {});

            this.callbacksArray.push(callbacks);
        },

        createServerEvents: function() {
            this.server.on('reconnect', this.reconnect.bind(this));
            this.server.on('forceReconnect', this.forceReconnect.bind(this));

            var self = this;
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
                localStorage.removeItem('playerguid');
                window.server = null;
                self.applyCallback('onDisconnect');
            });
        },

        // Инициализация
        init: function () {
            this.applyCallback('onStatusChanged', 'ready');

            // Если id нет
            if (!localStorage.getItem('playerguid')) {
                // Ждем ввода токена
                var self = this;
                this.$tokenForm.off('submit');
                this.$tokenForm.submit(function (e) {
                    e.preventDefault();

                    // И отправляем его на сервер
                    self.server.bind({token: self.$inputField.val().toLowerCase()}, function (data) {
                        if (data.status == 'success') { //  В случае успеха
                            // Стартуем джостик
                            self.start(data.guid);
                        } else {
                            self.applyCallback('onWrongToken');
                        }
                    });
                });

            } else { // иначе
                // переподключаемся к уже созданной связке
                this.reconnect();
            }
        },

        forceReconnect: function(theirAttempt) {
            this.applyCallback('onForceReconnect', theirAttempt);
            if (!theirAttempt) {
                var self = this;
                var guid = localStorage.getItem('playerguid');
                self.server.send({
                    type: '__forceReconnect__'
                }, function(data) {
                    self.server.unbind({guid: guid}, function(data) {
                        if (data.status == 'success') {
                            console.log('onReconnecting unbind success: ');
                            self.reconnect("k");
                        } else {
                            console.warn('onReconnecting error: ' + data.status);
                        }
                    });
                });
            } else {
                this.reconnect("k");
            }
        },

        // Переподключение
        // Используем сохранненный id связки
        reconnect: function (guid) {
            var self = this;

            guid || (guid = localStorage.getItem('playerguid'));

            this.server.bind({guid: guid}, function (data) {
                // Если все ок
                if (data.status == 'success') {
                    // Стартуем
                    self.start(data.guid);
                    // Если связки уже нет
                } else if (data.status == 'undefined guid') {
                    // Начинаем все заново
                    localStorage.removeItem('playerguid');
                    self.init();
                }
            });
        },

        start: function(guid) {
            console.log('start player');
            // Сохраняем id связки
            localStorage.setItem('playerguid', guid);
            this.applyCallback('onStatusChanged', 'game');
            this.applyCallback('onStart');
        }
    });

    return JConnector;
});