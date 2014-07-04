define([
    'lodash',
    'classy',
    'Connector',
    'utils/LocalStorage'
], function(_, Class, Connector, LocalStorage) {
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

        _setToken: function(token) {
            LocalStorage.set(LocalStorage.$keys.J.Token, token);
        },

        _setConsoleGuid: function(guid) {
            LocalStorage.set(LocalStorage.$keys.J.Console, guid);
        },

        _getToken: function() {
            return LocalStorage.get(LocalStorage.$keys.J.Token);
        },

        _getConsoleGuid: function() {
            return LocalStorage.get(LocalStorage.$keys.J.Console);
        },

        _removeLSInfo: function() {
            LocalStorage.unset(LocalStorage.$keys.J.Console);
            LocalStorage.unset(LocalStorage.$keys.J.Token);
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
                self._removeLSInfo();
                window.server = null;
                self.applyCallback('onDisconnect');
            });
        },

        init: function(forceNewToken) {
            var self = this;
            console.log('ready');
            // Если id нет
            if (!this._getConsoleGuid()) {
                // Получаем токен
                this.server.getToken({forceNewToken: forceNewToken}, function (token) {
                    console.log('token: ' + token);
                    self._setToken(token);
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
            this._setConsoleGuid(guid);
            this.applyCallback('onStart');
        },

        forceReconnect: function(theirAttempt) {
            var guid = this._getConsoleGuid();
            if (guid === null) {
                this.init(true);
                return;
            }
            this._removeLSInfo();
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

            guid || (guid = this._getConsoleGuid());

            // Используем сохранненный id связки
            this.server.bind({guid: guid}, function (data) {
                // Если все ок
                if (data.status == 'success') {
                    var prevToken = self._getToken();
                    console.log('using prev token: ' + prevToken);
                    prevToken || (prevToken = 'Already connected');
                    self.applyCallback('saveToken', prevToken);
                    // Стартуем
                    self.start(data.guid);
                    // Если связки уже нет
                } else if (data.status == 'undefined guid') {
                    // Начинаем все заново
                    self._removeLSInfo();
                    self.init();
                }
            });
        }


    });

    return CConnector;
});
