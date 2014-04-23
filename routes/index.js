
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { 
		title: 'No Turning Back',
		development: ('production' != process.env.NODE_ENV)
	});
};
