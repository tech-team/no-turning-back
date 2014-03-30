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
		if (!req.body || !req.body.name || !req.body.data) {
			resp.writeHead(400, 'Bad Request');
			resp.end("No data provided");
		}

        var levelName = req.body.name;
        var levelStr = req.body.data;

		var levelsDir = path.join('public', 'levels');
		fs.writeFile(path.join(levelsDir, levelName + '.json'), levelStr, function (err) {
		  	if (err)
                resp.status(400).send();

		  	resp.status(200).send("ok");
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