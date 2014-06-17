var express = require('express');
var http = require('http');
var path = require('path');

var enableCache = false;
var cacheAge = 60*60*24;


var app = express();
app.use(express.compress());

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'xml');
// development only
if ('development' == app.get('env')) {
	app.use(express.logger('dev'));
}

app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());
app.use(express.cookieParser("R+mP2QeS-\"WzN&<mFs]~_V6WMz X[} =<obw<G-"));
app.use(express.session({
	key: "sid",
	secret: "-b6`_$-+z4nbssRcQhxnv,EFeZvp^-_73TL>3o",
	cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 30
	}
}));

app.use(app.router);

if (enableCache)
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: cacheAge }));
else
    app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
	app.use(express.errorHandler());
	app.engine('xml', require('artist').render({
		cache: false,
		debug: true
	}));
});

app.configure('production', function(){
	app.engine('xml', require('artist').render({
		cache: true,
		debug: false
	}));
});

var conn_info = {
    host: 'localhost',
    user: 'NTBUser',
    password: 'NTB',
    db: 'NTBdb',
    collections: ["scores", "levels"]
};
var db = require("./server-utils/mongodb_helper").connect(conn_info);


var scores = require('./routes/scores')(db);
var levels = require('./routes/levels')(db);
var routes = require('./routes/index');

app.get('/', routes.index);
app.get('/joystick', routes.joystick);

app.get('/scores', scores.getFull);
app.post('/scores', scores.post);

app.get('/levels', levels.getLevel);
app.get('/levels/exists', levels.existLevel);
app.post('/levels', levels.addLevel);

app.get('/levels/campaigns', levels.getCampaignsNames);
app.get('/levels/campaigns/:name', levels.getCampaignLevels);

var server = http.createServer(app);

require('./server/server').init(server);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
