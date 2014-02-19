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
	  		this.on('change', function(model) {
	  			console.log("Player data: " + JSON.stringify(model));
	  		})

	  		//TODO: add validation, i.e. this.validate()
	  	}
    });

    return Player;
});