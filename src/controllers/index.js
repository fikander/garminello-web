'use strict';

const config = require('../config/app');

// Home
exports.home = function(req, res) {
    res.render('index', {
    	trello_api_key: config.TRELLO_API_KEY,
    	app_name: config.APP_NAME,
    	message: req.query.message
   	});
};


exports.profile = function(req, res) {
	res.render('profile', {
		user: req.user
	});
};


exports.trelloAuthorise = function (req, res) {
    res.render('trello_authorise', {
    	trello_api_key: config.TRELLO_API_KEY,
    	app_name: config.APP_NAME
    });
};
