'use strict';

const loginController = require('./controllers/login');
const indexController = require('./controllers/index');
const apiController = require('./controllers/api');

module.exports = function(app) {

    // Auth
    app.get('/register', loginController.registerPage);
    app.post('/register', loginController.registerPost);
    app.get('/login', loginController.loginPage);
    app.post('/login', loginController.checkLogin);
    app.get('/logout', loginController.logout);

    // Home
	app.get('/', indexController.home);
	app.get('/home', ensureAuthenticated, indexController.profile);

    // Bind trello
	app.get('/trello_authorise', ensureAuthenticated, indexController.trelloAuthorise);

	// API
    app.get('/api/watches', ensureApiAuthenticated, apiController.getWatches);
    app.get('/api/watches/:id', ensureApiAuthenticated, apiController.getWatch);
    app.post('/api/watches', ensureApiAuthenticated, apiController.addWatch);
    app.delete('/api/watches/:id', ensureApiAuthenticated, apiController.deleteWatch);
    app.get('/api/trello_token', ensureApiAuthenticated, apiController.getTrelloToken);
    app.post('/api/trello_token', ensureApiAuthenticated, apiController.addTrelloToken);
    app.delete('/api/trello_token', ensureApiAuthenticated, apiController.deleteTrelloToken);

    // API used from watch
    // - different auth rules
    // - returns status even if errors 200. actual error in json {status: sss, error: eee}
    app.param('watch_uuid', apiController.watchUuidParam);
    app.post('/api/watch/register', apiController.apiRegister);
    app.get('/api/watch/config/:watch_uuid', apiController.apiConfig);
	app.get('/api/watch/boards/:watch_uuid', apiController.apiBoards);
	app.get('/api/watch/board_lists/:watch_uuid/:board_id', apiController.apiBoardLists);

    // Auth Middleware
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    }

    function ensureApiAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.status(401).json({message: 'Not authenticated'});
    }
}