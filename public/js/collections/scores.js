define([
    'backbone',
    'models/player'
], 
function(Backbone, Player) {
    var Scores = Backbone.Collection.extend({
    	model: Player,

    	initialize: function() {
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

    return new Scores();
});