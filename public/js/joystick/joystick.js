define([
    'Connector'
], function(Connector) {
    var Joystick = function(callbacks) {
        callbacks = callbacks ? callbacks : {};
        callbacks.onStart = callbacks.onStart ? callbacks.onStart : function() {};
        callbacks.onMessage = callbacks.onMessage ? callbacks.onMessage : function(data) {};

        var message = document.getElementById('message');
        var input = document.getElementById('token');
        var start, init, reconnect;

        // Создаем связь с сервером
        var server = new Connector({
                server: ['bind'],
                remote: '/player'
            }
        );

        // Инициализация
        init = function () {
            message.innerHTML = 'ready';
            // Если id нет
            if (!localStorage.getItem('playerguid')) {
                // Ждем ввода токена
                input.parentNode.addEventListener('submit', function (e) {
                    e.preventDefault();

                    // И отправляем его на сервер
                    server.bind({token: input.value}, function (data) {
                        if (data.status == 'success') { //  В случае успеха
                            // Стартуем джостик
                            start(data.guid);
                        }
                    });
                }, false);

            } else { // иначе
                // переподключаемся к уже созданной связке
                reconnect();
            }
        };

        // Переподключение
        // Используем сохранненный id связки
        reconnect = function () {
            server.bind({guid: localStorage.getItem('playerguid')}, function (data) {
                // Если все ок
                if (data.status == 'success') {
                    // Стартуем
                    start(data.guid);
                    // Если связки уже нет
                } else if (data.status == 'undefined guid') {
                    // Начинаем все заново
                    localStorage.removeItem('playerguid');
                    init();
                }
            });
        };

        // Старт игры
        start = function (guid) {
            console.log('start player');
            // Сохраняем id связки
            localStorage.setItem('playerguid', guid);
            message.innerHTML = 'game';
            callbacks.onStart();
        };

        server.on('reconnect', reconnect);

        init();

        // Обмен сообщениями
        server.on('message', function (data, answer) {
            callbacks.onMessage(data);
            answer('answer');
        });

        window.server = server;
    };
    return Joystick;
});