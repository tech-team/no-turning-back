require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
	    jquery: "/js/lib/jquery",
        underscore: "/js/lib/underscore",
        backbone: "/js/lib/backbone",
        Connector: "/js/lib/Connector",
        FnQuery: "/js/lib/FnQuery",
        "socket.io": "/socket.io/socket.io"
    },
    shim: {
	    'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        "socket.io": {
            exports: "io"
        }
    }
});

define([
    'Connector'
], function(
    Connector
){
	var message = document.getElementById('message');
	var start, init, reconnect;

	// Создаем связь с сервером
	var server = new Connector({
			server: ['getToken', 'bind'],
			remote: '/console'
		}
	);

	// На подключении игрока стартуем игру
	server.on('player-joined', function(data){
		// Передаем id связки консоль-джостик
		start(data.guid);
	});

	// Инициализация
	init = function(){
		message.innerHTML = 'ready';
		// Если id нет
		if (!localStorage.getItem('consoleguid')){
			// Получаем токен
			server.getToken(function(token){
				message.innerHTML = 'token: ' + token;
			});
		} else { // иначе
			// переподключаемся к уже созданной связке
			reconnect();
		}
	};

	// Переподключение
	reconnect = function(){
		// Используем сохранненный id связки
		server.bind({guid: localStorage.getItem('consoleguid')}, function(data){
			// Если все ок
			if (data.status == 'success'){
				// Стартуем
				start(data.guid);
			// Если связки уже нет
			} else if (data.status == 'undefined guid'){
				// Начинаем все заново
				localStorage.removeItem('consoleguid');
				init();
			}
		});
	};

	server.on('reconnect', reconnect);

	// Старт игры
	start = function(guid){
		console.log('start console');
		// Сохраняем id связки
		localStorage.setItem('consoleguid', guid);
		message.innerHTML = 'game';
	};

	init();

	// Обмен сообщениями
	server.on('message', function(data, answer){
		console.log('message', data);
		answer('answer');
	});

	window.server = server;

	/*
	server.send('message', function(answer){
		console.log(answer);
	});
	*/
});
