define([
    'backbone',
    'models/player'
], 
function(Backbone, Player) {
    var Scores = Backbone.Collection.extend({
    	model: Player,

    	initialize: function() {
    		this.models = [
	    		{
	    			name: 'Igor',
	    			score: 754
	    		},
	    		{
	    			name: 'Rome',
	    			score: 200
	    		}
    		];
    	}
    });

    return new Scores();
});