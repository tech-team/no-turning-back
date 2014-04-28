define([
    'Connector'
], function(Connector){

    var Console = function(callbacks) {
        callbacks = callbacks ? callbacks : {};
        callbacks.onStarted = callbacks.onStarted ? callbacks.onStarted : function(token) {};
        callbacks.saveToken = callbacks.saveToken ? callbacks.saveToken : function(token) {};
        callbacks.onMessage = callbacks.onMessage ? callbacks.onMessage : function(data) {};
        callbacks.onDisconnect = callbacks.onDisconnect ? callbacks.onDisconnect : function() {};


//        var message = document.getElementById('message');
        var start, init, reconnect;

        // Создаем связь с сервером
        var server = new Connector({
                server: ['getToken', 'bind'],
                remote: '/console'
            }
        );

        // На подключении игрока стартуем игру
        server.on('player-joined', function (data) {
            // Передаем id связки консоль-джостик
            start(data.guid);
        });

        // Инициализация
        init = function () {
            console.log('ready');
            // Если id нет
            if (!localStorage.getItem('consoleguid')) {
                // Получаем токен
                server.getToken(function (token) {
                    console.log('token: ' + token);
                    callbacks.saveToken(token);
                });
            } else { // иначе
                // переподключаемся к уже созданной связке
                reconnect();
            }
        };

        // Переподключение
        reconnect = function () {
            // Используем сохранненный id связки
            server.bind({guid: localStorage.getItem('consoleguid')}, function (data) {
                // Если все ок
                if (data.status == 'success') {
                    callbacks.saveToken("Already connected");
                    // Стартуем
                    start(data.guid);
                    // Если связки уже нет
                } else if (data.status == 'undefined guid') {
                    // Начинаем все заново
                    localStorage.removeItem('consoleguid');
                    init();
                }
            });
        };

        server.on('reconnect', reconnect);

        // Старт игры
        start = function (guid) {
            console.log('start console');
            // Сохраняем id связки
            localStorage.setItem('consoleguid', guid);
            callbacks.onStarted();
        };

        init();

        // Обмен сообщениями
        server.on('message', function (data, answer) {
            callbacks.onMessage(data, answer);
//            answer('answer');
        });

        server.on('disconnect', callbacks.onDisconnect);
        window.server = server;


    };
    return Console;
});
