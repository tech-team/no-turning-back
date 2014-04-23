
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', {
		title: 'No Turning Back',
		development: ('production' != process.env.NODE_ENV)
	});
};
/*
 * GET joystick page.
 */

exports.joystick = function(req, res){
	res.render('joystick', {
		title: 'Технопарк',
		development: ('production' != process.env.NODE_ENV)
	});
};

