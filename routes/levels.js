var fs = require('fs');
var path = require('path');

module.exports = {
	getLevel: function(req, resp) {
		var id = req.query.id;

		var levelsDir = path.join('public', 'levels', 'level' + id + '.json');
		fs.readFile(levelsDir, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
		  	}
		  	resp.end(data);
		});
	},

	addLevel: function(req, resp) {

	}
};