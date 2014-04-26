var tokens = {};
var bindings = {};
var guid = require('guid');

var functions = {
	getToken: function(data, answer){
		var token;

		if (this.token){
			token = this.token;
		} else {
			var min = parseInt(1000,16);
			var max = parseInt('ffff',16);

			do {
				token = Math.floor( min + ( max - min ) * Math.random() ).toString(16);
			} while( tokens[token] );

			tokens[token] = {
				console: this
			};

			this.token = token;

			this.on('disconnect', onDisconnect);
		}

		answer(token);
	},
	bind: function(data, answer){
		var type = this.namespace.name.substr(1);

		if (type == 'player'){
			if (data.token){
				if (!tokens[data.token]){
					answer({
						status: 'undefined token',
						error: true
					});

				} else if (tokens[data.token].player){
					answer({
						status: 'busy token',
						error: true
					});

				} else {
					var g;
					g =  guid.create().value;
					answer({
						status: 'success',
						guid: g
					});

					bindings[g] = tokens[data.token];
					bindings[g].player = this;

					bindings[g].console.token = null;
					bindings[g].console.binding = bindings[g].player.binding = bindings[g];

					bindings[g].console.emit('sms', {type: 'player-joined', data: {guid: g}});

					bindings[g].console.on('sms', sms);
					bindings[g].player.on('sms', sms);

					//this.on('disconnect', onDisconnect);

					delete tokens[data.token];
				}

			} else if (data.guid){
				if (bindings[data.guid]){
					var g = data.guid;

					answer({
						status: 'success',
						guid: data.guid
					});

					bindings[g].player = this;
					bindings[g].player.binding = bindings[g];
					bindings[g].player.on('sms', sms);

				} else {
					answer({
						status: 'undefined guid',
						error: true
					});
				}
			}

		} else {
			if (data.guid){
				if (bindings[data.guid]){
					var g = data.guid;

					answer({
						status: 'success',
						guid: data.guid
					});

					bindings[g].console = this;
					bindings[g].console.binding = bindings[g];
					bindings[g].console.on('sms', sms);

				} else {
					answer({
						status: 'undefined guid',
						error: true
					});
				}
			}
		}

	}
};

function sms(data, answer){
	var binding = this.binding;
	var sock = binding.console === this ? binding.player : binding.console;

	sock.emit('sms', data, function(data){
		answer(data);
	});
}

function onDisconnect(a,b,c){
	console.log('---- this -----', this.binding);
};

module.exports = {
	init: function(app){
		var types = ['console', 'player'];

		var io = require('socket.io').listen(app);

		for (var i = 0, l = types.length; i < l; i++){
			var type = types[i];

			io
				.of('/' + type)
				.on('connection', function(socket){
					socket.on('getFnList', function(answer){
						var fns = [];

						for (var f in functions) if (functions.hasOwnProperty(f)){
							fns.push(f);
						}

						answer && answer(fns);
					});

					socket.on('fnCall', function(data, answer){
						if (functions[data.name]){
							functions[data.name].call(socket, data.data, answer || function(){});
						} else {
							answer && answer('error');
						}
					})
				});
		}


		return;






		var io = require('socket.io').listen(server);

		io.on('connection', function(socket){
			socket.on('get', function (data, fn) {
				if (data == 'token'){
					getToken(socket);
					fn(socket.token);
				}
			});

			socket.on('bind', function(token, fn){
				if (guid.isGuid(token)){
					if (bindings[token]){
						fn({
							status: 'success',
							guid: g
						});
						return;
					} else {
						fn({
							status: 'error'
						});
					}

					return;
				}

				if (!tokens[token]){
					fn({
						status: 'undefined token'
					});

				} else if (tokens[token].player){
					fn({
						status: 'unsuccess'
					});

				} else {
					var g =  guid.create().value;
					fn({
						status: 'success',
						guid: g
					});

					tokens[token].player = socket;
					bindings[g] = tokens[token];

					bindings[g].console.emit('start', {guid: g});
				}
			});

			socket.on('restore', function(guid, fn){
				if (bindings[guid] && bindings[guid].console == socket){
					fn({
						status: 'success'
					});
				} else {
					fn({
						status: 'error'
					});
				}
			});

			socket.on('sms', function(data, fn){
				var binding = bindings[data.guid];
				var sock = binding.console === socket ? binding.player : binding.console;

				sock.emit('sms', data, function(data){
					fn(data);
				});

			});
		});
	}
};


