var fs = require('fs');
var path = require('path');
var utils = require('../server-utils/utils.js');


function retrieveLevel(db, name, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

    return db.levels.find({name: name}, {_id: false}, {limit: 1}, function(err, level) {
        if (!err && level && level[0]) {
            callbacks.success(level[0]);
        } else {
            callbacks.error("Couldn't load data");
        }
    });
}

function removeLevel(db, levelName, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

    db.levels.remove({"name": levelName},
    function(err, removed) {
        if (err) {
            callbacks.error("could not remove");
        } else {
            callbacks.success(removed);
        }
    });
}

function saveLevel(db, levelInfo, callbacks) {
    callbacks = utils.default_callbacks(callbacks, ['before']);

    callbacks.before({
        success: function() {
            db.levels.save(levelInfo, function(err, saved) {
                if( err || !saved ) callbacks.error("Level was not saved");
                else callbacks.success("ok");
            });
        },
        error: callbacks.error
    });


}

var levelsRoute = function(db) {
    return {
        getLevel: function (req, resp) {
            var name = req.query.name;

            retrieveLevel(db, name, {
                success: function(levelData) {
                    resp.end(JSON.stringify(levelData));
                },
                error: function(msg) {
                    resp.status(404).end(msg);
                }
            });
        },

        addLevel: function (req, resp) {
            if (!req.body || !req.body.name || !req.body.data) {
                resp.status(400).end("No data provided");
            }

            var levelName = req.body.name;
            var levelStr = req.body.data;

            var errorCallback = function(msg) {
                resp.status(400).end(msg);
            };


            saveLevel(db, JSON.parse(levelStr), {
                before: function(callbacks) {
                    removeLevel(db, levelName, callbacks);
                },
                success: function(msg) {
                    /*************** Git purposes only ***************/
                    var levelsDir = path.join('public', 'levels');
                    fs.writeFile(path.join(levelsDir, levelName + '.json'), levelStr, function (err) {});

                    resp.end(msg);
                },
                error: errorCallback
            });

//            removeLevel(db, function(removedNumber) {
//                var success = function(msg) {
//                    /*************** Git purposes only ***************/
//                    var levelsDir = path.join('public', 'levels');
//                    fs.writeFile(path.join(levelsDir, levelName + '.json'), levelStr, function (err) {
//                    });
//
//                    resp.end(msg);
//                };
//
//                saveLevel(db, success, errorCallback, JSON.parse(levelStr));
//
//            }, errorCallback, levelName);



        },

        existLevel: function (req, resp) {
            var name = req.query.name;

            if (!name) {
                resp.status(400).end("Level name not provided");
            }

            retrieveLevel(db, name, {
                success: function() {
                    resp.end(String(true));
                },
                error: function() {
                    resp.end(String(false));
                }
            });
        }
    }
};

module.exports = levelsRoute;