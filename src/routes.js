const config = require('./config/app');
const pg = require('pg');

module.exports = function(app) {

	app.get('/', function(req, res) {
	    res.render('index', {
	    	trello_api_key: config.TRELLO_API_KEY,
	    	app_name: config.APP_NAME,
	    	message: req.query.message,
	    	partials: {_header: '_header'}
	   	});
	});

	// app.get('/', function (req, res) {
	//     console.log(req.headers.host);
	//     console.log(req.protocol);
	//     console.log(req.originalUrl);
	//     var return_url = req.protocol + "://" + req.headers.host + '/trello_token';
	//     res.redirect(
	//         "https://trello.com/1/authorize?"+
	//         "expiration=never" +
	//         "&name=Garminello" + 
	//         "&key=" + TRELLO_API_KEY +
	//         "&scope=read" + 
	//         "&callback_method=postMessage" +
	//         "&return_url=" + return_url);
	// });

	app.get('/trello_authorise', function (req, res) {
	    res.render('trello', {
	    	trello_api_key: config.TRELLO_API_KEY,
	    	app_name: config.APP_NAME,
	    	partials: {_header: '_header'}
	    });
	});

	app.get('/trello_authorise_enter_watch', function(req, res) {
	    res.render('trello_enter_watch', {
	    	trello_api_key: config.TRELLO_API_KEY,
	    	app_name: config.APP_NAME,
	    	ttoken: req.query.ttoken,
	    	partials: {_header: '_header'}
	   	});
	});

}