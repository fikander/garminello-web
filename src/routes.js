const config = require('./config/app');
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

    // Auth Middleware
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    }

    // Home
	app.get('/', indexController.home);
	app.get('/home', ensureAuthenticated, indexController.profile);
	app.get('/trello_authorise', ensureAuthenticated, indexController.trelloAuthorise);
	app.get('/trello_authorise_enter_watch', ensureAuthenticated, indexController.trelloAuthoriseEnterWatch);

	// API
	app.get('/bind_trello_watch', apiController.bindTrelloWatch);
	app.get('/api/boards', apiController.apiBoards);
	app.get('/api/board_lists', apiController.apiBoardLists);
	app.get('/api/config', apiController.apiConfig);

}