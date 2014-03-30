define([
    'backbone',
    'models/player',
    'collections/LocalStorage'
], 
function(Backbone, Player, LocalStorage) {
    var ScoreBoard = Backbone.Collection.extend({
    	model: Player,
        localStorageScoreKey: "scores",

    	initialize: function() {
            var self = this;
            this.on('add', function(model) {
                var data_set = {
                    name: model.get('name'),
                    score: model.get('score')
                };
                self.sendScore(data_set);
            });
    	},

        sendScore: function(score_data, without_echoing) {
            var self = this;
            $.ajax({
                    type: 'POST',
                    url: 'scores',
                    data: score_data,
                    dataType: 'json',
                    beforeSend: function() {
                        if (!without_echoing) {
                            $.event.trigger({
                                type: "scoreSending"
                            });
                        }
                    },
                    success: function(data) {
                        if (!without_echoing) {
                            $.event.trigger({
                                type: "scoreSent",
                                response: data
                            });
                        }
                    },
                    error: function(data) {
                        LocalStorage.addToArray(self.localStorageScoreKey, score_data);
                        if (!without_echoing) {
                            $.event.trigger({
                                type: "scoreSendFailed",
                                response: data,
                                message: "Connection Failed. Score saved locally."
                            });
                        }
                    }
            });
        },

        retrieve: function(limitCount) {
            var self = this;

            $.ajax({
                    type: 'GET',
                    url: 'scores',
                    data: {
                        limit: limitCount
                    },
                    dataType: 'json',
                    beforeSend: function() {
                        $.event.trigger({
                            type: "scoresRetrieving"
                        });

                        var savedScores = LocalStorage.getJSON(self.localStorageScoreKey);
                        if (savedScores) {
                            console.log("There are scores saved locally. Attempt to send them to the server.");
                            _.each(savedScores,
                                function(elem, i) {
                                    LocalStorage.popFromArray(self.localStorageScoreKey);
                                    self.sendScore(elem, true);
                                });
                        }

                    },
                    success: function(data) {
                        self.models = [];
                        for (var i = 0; i < data.length; ++i) {
                            self.models.push(new Player(data[i]));
                        }

                        $.event.trigger({
                            type: "scoresRetrieved",
                            response: data
                        });
                    },
                    error: function(data) {
                        $.event.trigger({
                            type: "scoresRetrievingFailed",
                            response: data
                        });
                    }
                });
        },

        comparator: function(a, b) {
            a = a.get(this.sort_key);
            b = b.get(this.sort_key);
            return a > b ?  1
                 : a < b ? -1
                 :          0;
        },

        reverseComparator: function(a, b) {
            a = a.get(this.sort_key);
            b = b.get(this.sort_key);
            return a > b ? -1
                 : a < b ? 1
                 :          0;
        },

        sortByScore: function(ascending) {
            if (!ascending)
                this.comparator = this.reverseComparator;
            this.sort_key = "score";
            this.sort();
        }
    });

    return new ScoreBoard();
});