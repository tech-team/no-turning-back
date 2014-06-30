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

function retrieveCampaigns(db, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

//    db.levels.aggregate({$sort: {name: 1}}, {$group: {_id: "$campaign", levels: {$push: "$name"}}}, {$project: {_id: 0, campaign: "$_id", levels: 1}})
//    db.levels.aggregate({$group: {_id: "$campaign", levelsCount: {$sum: 1}}}, {$project: {_id: 0, campaign: "$_id", levelsCount: "$levelsCount"}})

    var selection = [
        { $group: {_id: "$campaign", levels: {$push: "$name"}} },
        { $match: {_id: {$ne: "Workshop"}} },
        { $unwind: "$levels" },
        { $sort: {_id: 1, levels: 1} },
        { $group: {_id: "$_id", levels: {$push: "$levels"}} },
        { $sort: {_id: 1} },
        { $project: {campaign: "$_id", levels: 1, _id: 0} }
    ];

//    var selection = [
//        { $group: {_id: "$campaign", levelsCount: {$sum: 1}} },
//        { $match: {_id: {$ne: "Workshop"}} },
//        { $project: {_id: 0, campaign: "$_id", levelsCount: "$levelsCount"} }
//    ];

    db.levels.aggregate(selection, function(err, data) {
        if (err || !data) {
            callbacks.error(err);
        } else {
            callbacks.success(data);
        }
    });
}

function retrieveCampaignLevelNames(db, campaignName, callbacks) {
    callbacks = utils.default_callbacks(callbacks);

    db.levels.find({campaign: campaignName}, {_id: 0, name: 1}, {sort: "name"}).toArray(function(err, levels) {
        if (err || !levels) {
            callbacks.error(err);
        } else {
            var levelsNames = [];
            for (var i = 0; i < levels.length; ++i) {
                levelsNames.push(levels[i].name);
            }
            callbacks.success(levelsNames);
        }
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
        },

        getCampaignsNames: function(req, resp) {
            retrieveCampaigns(db, {
                success: function(data) {
                    resp.end(JSON.stringify(data));
                },
                error: function(err) {
                    resp.status(400).end(err);
                }
            });
        },

        getCampaignLevels: function(req, resp) {
            var campaignName = req.params.name;
            retrieveCampaignLevelNames(db, campaignName, {
                success: function(levels) {
                    resp.end(JSON.stringify(levels));
                },
                error: function(err) {
                    resp.status(400).end(err);
                }
            });
        }
    }
};

module.exports = levelsRoute;