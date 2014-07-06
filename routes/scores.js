var utils = require('../server-utils/utils.js');

function retrieveScores(db, limit, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

    var options = {
        "sort": [['score', 'desc']]
    };
    if (limit && !isNaN(parseInt(limit, 10))) {
        options['limit'] = limit;
    }

    return db.scores.find({}, {_id: 0}, options).toArray(function(err, objs) {
        if (!err) {
            callbacks.success(objs);
        } else {
            callbacks.error("Couldn't load data");
        }
    });
}

function saveScore(db, scoreInfo, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

    db.scores.save(scoreInfo, function(err, saved) {
        if( err || !saved ) callbacks.error("Score was not saved");
        else callbacks.success({
            id: saved._id.valueOf(),
            name: saved.name,
            score: saved.score
        });
    });
}

var scoresRoute = function(db) {
    return {
        getFull: function (req, res) {
            retrieveScores(db, req.query.limit, {
                success: function(s) {
//                    setTimeout(function() {
                        res.send(s);
//                    }, 1000);

                },
                error: function(err) {
                    res.send(503, err);
                }
            });
        },

        post: function (req, res) {
            var newScore = req.body;

            if (!newScore || !newScore.name || !newScore.score || newScore.score && isNaN(parseInt(newScore.score, 10))) {
                res.send(400);
                return;
            }
            newScore.score = parseInt(newScore.score, 10);

            saveScore(db, newScore, {
                success: function(newScore) {
                    res.send(newScore);
                },
                error: function(err) {
                    res.send(503, err);
                }
            });
        }
    }
};

module.exports = scoresRoute;
