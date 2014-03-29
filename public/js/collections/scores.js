define([
    'backbone',
    'models/player'
], 
function(Backbone, Player) {
    var ScoreBoard = Backbone.Collection.extend({
    	model: Player,

    	initialize: function() {
            this.on('add', function(model) {
                var data_set = {
                    name: model.get('name'),
                    score: model.get('score')
                };
                console.log(JSON.stringify(data_set));
                $.ajax({
                    type: 'POST',
                    url: 'scores',
                    data: data_set,
                    dataType: 'json',
                    beforeSend: function() {
                        $.event.trigger({
                            type: "scoreSending"
                        });
                    },
                    success: function(data) {
                        $.event.trigger({
                            type: "scoreSent",
                            response: data
                        });
                    },
                    error: function(data) {
                        $.event.trigger({
                            type: "scoreSendFailed",
                            response: data
                        });
                    }
                });

            });



    		this.models = [
	    		new Player({
	    			name: 'Igor',
	    			score: 754
	    		}),
                new Player({
                    name: 'Vasja',
                    score: 1
                }),
                new Player({
	    			name: 'Rome',
	    			score: 200
	    		})
    		];
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