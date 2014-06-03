var fs = require('fs');
var path = require('path');

function retrieveLevel(db, callback, errorCallback, name) {
    return db.levels.find({name: name}, {_id: false}, {limit: 1}, function(err, level) {
        if (!err && level && level[0]) {
            callback(level[0]);
        } else {
            errorCallback("Couldn't load data");
        }
    });
}

function saveLevel(db, callback, errorCallback, levelInfo) {
    console.log("saving");
    db.levels.save(levelInfo, function(err, saved) {
        if( err || !saved ) errorCallback("Level was not saved");
        else callback("ok");
    });
}

var levelsRoute = function(db) {
    return {
        getLevel: function (req, resp) {
            var name = req.query.name;

            var success = function(levelData) {
                resp.setHeader('Content-Type', 'application/json');
                resp.end(JSON.stringify(levelData));
            };

            var errorCallback = function(msg) {
                resp.status(404).end(msg);
            };

            retrieveLevel(db, success, errorCallback, name);
        },

        addLevel: function (req, resp) {
            if (!req.body || !req.body.name || !req.body.data) {
                resp.status(400).end("No data provided");
            }

            var levelName = req.body.name;
            var levelStr = req.body.data;

            var success = function(msg) {
                /*************** Git purposes only ***************/
                var levelsDir = path.join('public', 'levels');
                fs.writeFile(path.join(levelsDir, levelName + '.json'), levelStr, function (err) {
                });

                resp.end(msg);

            };

            var errorCallback = function(msg) {
                resp.status(400).end(msg);
            };

            saveLevel(db, success, errorCallback, JSON.parse(levelStr));


        },

        existLevel: function (req, resp) {
            var name = req.query.name;

            if (!name) {
                resp.status(400).end("Level name not provided");
            }

            var success = function(levelData) {
                resp.end(String(true));
            };

            var errorCallback = function(msg) {
                resp.end(String(false));
            };

            retrieveLevel(db, success, errorCallback, name);
        }
    }
};

module.exports = levelsRoute;