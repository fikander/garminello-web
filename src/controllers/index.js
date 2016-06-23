'use strict';

const config = require('../config/app');

// Home
exports.home = function(req, res) {
    res.render('index', {
    	trello_api_key: config.TRELLO_API_KEY,
    	app_name: config.APP_NAME,
    	message: req.query.message,
        analytics_tracking_id: config.ANALYTICS_TRACKING_ID
   	});
};


exports.profile = function(req, res) {
	res.render('profile', {
        trello_api_key: config.TRELLO_API_KEY,
        app_name: config.APP_NAME,
		user: req.user,
        analytics_tracking_id: config.ANALYTICS_TRACKING_ID
	});
};


exports.trelloAuthorise = function(req, res) {
    res.render('trello_authorise', {
    	trello_api_key: config.TRELLO_API_KEY,
    	app_name: config.APP_NAME,
        analytics_tracking_id: config.ANALYTICS_TRACKING_ID
    });
};

exports.privacy = function(req, res) {
    res.render('privacy', {
        app_name: config.APP_NAME,
        user: req.user,
        analytics_tracking_id: config.ANALYTICS_TRACKING_ID
    })
};
