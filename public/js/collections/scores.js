define([
    'backbone',
    'models/player',
    'utils/LocalStorage'
], 
function(Backbone, Player, LocalStorage) {
    var ScoreBoard = Backbone.Collection.extend({
    	model: Player,
        url: 'scores/',
        localStorageScoreKey: "scores",

    	initialize: function() {

    	},

        saveLocally: function(data) {
            LocalStorage.addToArray(this.localStorageScoreKey, data);
        },

        getData: function(limitCount) {
            var self = this;

            var errorCallback = function() {
                self.trigger('fetchFailed', 'Connection Error. Try again later.');
            };
            this.resendSaved({
                success: function() {
                    self.fetch({
                        reset: true,
                        data: { limit: limitCount },
                        error: errorCallback
                    });
                },
                error: errorCallback
            });
        },

        resendSaved: function(callbacks) {
            callbacks.success = callbacks.success ? callbacks.success : function(data) {};
            callbacks.error = callbacks.error ? callbacks.error : function(data) {};

            var savedScores = LocalStorage.getJSON(this.localStorageScoreKey);
            if (savedScores && savedScores.length != 0) {
                console.log("There are scores saved locally. Attempt to send them to the server.");
                this._sendingRoutine(savedScores, savedScores.length-1, callbacks);
            } else {
                callbacks.success();
            }
        },

        _sendingRoutine: function(array, index, callbacks) {
            var self = this;
            this.sendScore(array[index], {
                success: function(data) {
                    LocalStorage.popFromArray(self.localStorageScoreKey);
                    if (index > 0) {
                        self._sendingRoutine(array, index - 1, callbacks);
                    } else {
                        callbacks.success();
                    }
                },
                fail: callbacks.error
            });
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
        }
    });

    return new ScoreBoard();
});