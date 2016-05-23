'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

const cons = require('consolidate');

const passport = require('passport');
const session = require('express-session');
const messages = require('./util/messages');

const config = require('./config/app');
const knex = require('knex')({
	client: 'pg',
	connection: config.DATABASE_URL
});
const Bookshelf = require('bookshelf');

const crypto = require('crypto');

const Trello = require('node-trello');

// Constants
const PORT = process.env.PORT || 8080;

// App
const app = express();

Bookshelf.postgres = Bookshelf(knex);

app.set('port', PORT);

// template engine
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', './src/client/views');

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(session({
	secret: 'weroWJgj32hDWOfr923nwfWji32bzppwbi34',
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(messages());

require('./util/passport')(passport);
// routes
require('./routes.js')(app);
require('./auth_routes.js')(app, passport);
require('./api_routes.js')(app);

app.listen(app.get('port'), function() {
    console.log('Running on port:' + app.get('port'));
});
