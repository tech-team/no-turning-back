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

    	},

        saveLocally: function(data) {
            LocalStorage.addToArray(this.localStorageScoreKey, data);
        },

        sendScore: function(score_data, callbacks) {
            callbacks.before = callbacks.before ? callbacks.before : function() {};
            callbacks.success = callbacks.success ? callbacks.success : function(data) {};
            callbacks.fail = callbacks.fail ? callbacks.fail : function(data) {};

            var self = this;
            $.ajax({
                    type: 'POST',
                    url: 'scores',
                    data: score_data,
                    dataType: 'json',
                    beforeSend: function() {
                        callbacks.before();
                    },
                    success: function(data) {
                        callbacks.success(data);
                        self.add(new Player(score_data));
                    },
                    error: function(data) {
                        callbacks.fail({
                            data: data,
                            message: "Connection Problem. You can save score locally."
                        });
                    }
            });
        },

        resendSaved: function() {
            var self = this;

            var savedScores = LocalStorage.getJSON(self.localStorageScoreKey);
            if (savedScores && savedScores.length != 0) {
                console.log("There are scores saved locally. Attempt to send them to the server.");

                var finished = false;
                for (var i = 0; i < savedScores.length; ++i) {
                    self.sendScore(savedScores[i], {
                        success: function(data) {
                            LocalStorage.popFromArray(self.localStorageScoreKey);
                        },
                        fail: function(data) {
                            finished = true;
                        }
                    });
                    if (finished)
                        break;
                }
            }
        },

        retrieve: function(limitCount, callbacks) {
            var self = this;

            $.ajax({
                    type: 'GET',
                    url: 'scores',
                    data: {
                        limit: limitCount
                    },
                    dataType: 'json',
                    beforeSend: function() {
                        callbacks.before();
                        self.resendSaved();
                    },

                    success: function(data) {
                        self.reset();
                        for (var i = 0; i < data.length; ++i) {
                            self.add(new Player(data[i]));
                        }

                        callbacks.success(data);
                    },

                    error: function(data) {
                        callbacks.fail({
                            data: data,
                            message: "Connection Error. Try again later."
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