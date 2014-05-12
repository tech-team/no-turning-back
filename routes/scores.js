var dbUrl = "NTBUser:NTB@localhost:27017/NTBdb";
var collections = ["scores"];
var db = require("mongojs").connect(dbUrl, collections);


//var scores = [];
//
//db.scores.find({}, function(err, scoresRes) {
//    if( err || !scoresRes) console.log("No scores found");
//    else scoresRes.forEach( function(score) {
//        scores.push(score);
//    } );
//});

//function sortScores(){
//	scores.sort(function(a,b) {
//		return b.score - a.score;
//	});
//}

function retrieveScores(callback, errorCallback, limit) {
    var options = {
        "sort": [['score', 'desc']]
    };
    if (limit) {
        options['limit'] = limit;
    }

    return db.scores.find({}, options).toArray(function(err, objs) {
        if (!err) {
            callback(objs);
        } else {
            errorCallback("Couldn't load data");
        }
    });
}

function saveScore(callback, errorCallback, scoreInfo) {
    db.scores.save(scoreInfo, function(err, saved) {
        if( err || !saved ) errorCallback("Score was not saved");
        else callback({
            id: saved._id.valueOf(),
            name: saved.name,
            score: saved.score
        });
    });
}

module.exports = {
	getFull: function(req, res) {
        var callback = function(s) {
            s = JSON.stringify(s);
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', Buffer.byteLength(s));
            res.end(s);
        };

        var errorCallback = function(err) {
            res.writeHead(500, 'Internal Server Error');
            res.end(err);
        };

		var s;
		if (req.query.limit && !isNaN(parseInt(req.query.limit, 10))){
            s = retrieveScores(callback, errorCallback, req.query.limit);
		} else {
			s = retrieveScores(callback, errorCallback);
		}

	},

	/*getOne: function(req, res){
		var id = req.params.id,
			founded;

		if (!id || isNaN(parseInt(id, 10))){
			res.writeHead(400, 'Bad Request');
			res.end();
			return;
		}

		for (var i = 0, l = scores.length; i < l; i++){
			var score = scores[i];

			if (score.id == id){
				founded = score;
				break;
			}
		}

		if (founded){
			res.writeHead(200, 'OK');
			founded = JSON.stringify(founded);
			res.setHeader('Content-Type', 'application/javascript');
			res.setHeader('Content-Length', Buffer.byteLength(founded));
			res.end(founded);
		} else {
			res.writeHead(404, 'Not Found');
			res.end();
		}
	},*/

	post: function(req, res){
		var newScore = req.body;

		if (!newScore || !newScore.name || !newScore.score || newScore.score && isNaN(parseInt(newScore.score, 10))){
			res.writeHead(400, 'Bad Request');
			res.end();
			return;
		}
        newScore.score = parseInt(newScore.score, 10);

        var callback = function(newScore) {
            var s = JSON.stringify(newScore);
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', Buffer.byteLength(s));
            res.end(s);
        };

        var errorCallback = function(err) {
            res.writeHead(500, 'Internal Server Error');
            res.end(err);
        };

        saveScore(callback, errorCallback, newScore);
	}/*,

	del :function(req, res){
		var id = req.params.id,
			founded;

		if (!id || isNaN(parseInt(id, 10))){
			res.writeHead(400, 'Bad Request');
			res.end();
			return;
		}

		for (var i = 0, l = scores.length; i < l; i++){
			var score = scores[i];

			if (score.id == id){
				scores.splice(i, 1);
				founded = true;
				break;
			}
		}

		sortScores();

		if (founded){
			res.writeHead(200, 'OK');
			res.end();
		} else {
			res.writeHead(404, 'Not Found');
			res.end();
		}
	},

	put: function(req, res){
		var id = req.params.id,
			score;

		if (!id || isNaN(parseInt(id, 10))){
			res.writeHead(400, 'Bad Request');
			res.end();
			return;
		}

		var newScore = req.body;

		if (!newScore || !newScore.name || !newScore.score || newScore.score && isNaN(parseInt(newScore.score, 10))){
			res.writeHead(400, 'Bad Request');
			res.end();
			return;
		}

		for (var i = 0, l = scores.length; i < l; i++){
			score = scores[i];

			if (score.id == id){
				scores.splice(i, 1, newScore);

				var s = JSON.stringify(score);
				res.setHeader('Content-Type', 'application/javascript');
				res.setHeader('Content-Length', Buffer.byteLength(s));
				res.end(s);
				return;
			}
		}

		res.writeHead(404, 'Not Found');
		res.end();
	}*/
};
