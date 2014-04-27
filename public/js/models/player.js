define([
    'backbone'
], 
function(Backbone) {
    var Player = Backbone.Model.extend({
    	defaults: {
		    name: '',
		    score: 0
	  	},

	  	initialize: function() {
	  	}
    });

    return Player;
});