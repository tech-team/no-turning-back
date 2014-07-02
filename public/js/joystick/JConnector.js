define([
    'classy',
    'Connector'
], function(Class, Connector) {
    var JConnector = Class.$extend({
        __init__: function($tokenForm, $inputField, callbacks) {
            this.$tokenForm = $tokenForm;
            this.$inputField = $inputField;
            this.callbacks = null;
            this.setCallbacks(callbacks);

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

        setCallbacks: function(callbacks) {
            callbacks || (callbacks = {});
            callbacks.onStart || (callbacks.onStart = function() {});
            callbacks.onMessage || (callbacks.onMessage = function(data) {});
            callbacks.onStatusChanged || (callbacks.onStatusChanged = function(status) {});
            callbacks.onDisconnect || (callbacks.onDisconnect = function() {});
            callbacks.onWrongToken || (callbacks.onWrongToken = function() {});

            this.callbacks = callbacks;
        },

        createServerEvents: function() {
            this.server.on('reconnect', this.reconnect.bind(this));

            var self = this;
            // Обмен сообщениями
            this.server.on('message', function (data, answer) {
                self.callbacks.onMessage(data);
                answer('answer');
            });

            this.server.on('disconnect', function() {
                window.server = null;
                self.callbacks.onDisconnect();
            });
        },

        // Инициализация
        init: function () {
            this.callbacks.onStatusChanged('ready');

            // Если id нет
            if (!localStorage.getItem('playerguid')) {
                // Ждем ввода токена
                var self = this;
                this.$tokenForm.submit(function (e) {
                    e.preventDefault();

                    // И отправляем его на сервер
                    self.server.bind({token: self.$inputField.val().toLowerCase()}, function (data) {
                        if (data.status == 'success') { //  В случае успеха
                            // Стартуем джостик
                            self.start(data.guid);
                        } else {
                            self.callbacks.onWrongToken();
                        }
                    });
                });

            } else { // иначе
                // переподключаемся к уже созданной связке
                this.reconnect();
            }
        },

        // Переподключение
        // Используем сохранненный id связки
        reconnect: function () {
            var self = this;

            this.server.bind({guid: localStorage.getItem('playerguid')}, function (data) {
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
            this.callbacks.onStatusChanged('game');
            this.callbacks.onStart();
        }
    });

    return JConnector;
});