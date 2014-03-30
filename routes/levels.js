var fs = require('fs');
var path = require('path');

module.exports = {
	getLevel: function(req, resp) {
		var name = req.query.name;

		var levelsDir = path.join('public', 'levels');
		fs.readFile(path.join(levelsDir, name + '.json'), 'utf8', function (err, data) {
			if (err) {
				resp.writeHead(404, 'Not Found');
				resp.end(err);
		  	}
		  	resp.setHeader('Content-Type', 'application/json');
		  	resp.end(data);
		});
	},

	addLevel: function(req, resp) {
		var data = req.body;
		if (!data) {
			resp.writeHead(400, 'Bad Request');
			resp.end("No data provided");
		}

		var levelsDir = path.join('public', 'levels');
		fs.writeFile(path.join(levelsDir, data.name + '.json'), JSON.stringify(data), function (err) {
		  	if (err) throw err;
		  	resp.end();
		});
	},

	existLevel: function(req, resp) {
		var name = req.query.name;

		if (!name) {
			resp.writeHead(400, 'Bad Request');
			resp.end("Level name not provided");
		}

		var levelsDir = path.join('public', 'levels');
		fs.exists(path.join(levelsDir, name + '.json'), function (exists) {
		  	resp.end(String(exists));
		});
	}
};