
function retrieveScores(db, callback, errorCallback, limit) {
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

function saveScore(db, callback, errorCallback, scoreInfo) {
    db.scores.save(scoreInfo, function(err, saved) {
        if( err || !saved ) errorCallback("Score was not saved");
        else callback({
            id: saved._id.valueOf(),
            name: saved.name,
            score: saved.score
        });
    });
}

var scoresRoute = function(db) {
    return {
        getFull: function (req, res) {
            var callback = function (s) {
                s = JSON.stringify(s);
                res.setHeader('Content-Type', 'application/javascript');
                res.setHeader('Content-Length', Buffer.byteLength(s));
                res.end(s);
            };

            var errorCallback = function (err) {
                res.status(503).end(err);
            };

            var s;
            if (req.query.limit && !isNaN(parseInt(req.query.limit, 10))) {
                s = retrieveScores(db, callback, errorCallback, req.query.limit);
            } else {
                s = retrieveScores(db, callback, errorCallback);
            }

        },

        post: function (req, res) {
            var newScore = req.body;

            if (!newScore || !newScore.name || !newScore.score || newScore.score && isNaN(parseInt(newScore.score, 10))) {
                res.status(400).end();
                return;
            }
            newScore.score = parseInt(newScore.score, 10);

            var callback = function (newScore) {
                var s = JSON.stringify(newScore);
                res.setHeader('Content-Type', 'application/javascript');
                res.setHeader('Content-Length', Buffer.byteLength(s));
                res.end(s);
            };

            var errorCallback = function (err) {
                res.status(503).end(err);
            };

            saveScore(db, callback, errorCallback, newScore);
        }
    }
};

module.exports = scoresRoute;
