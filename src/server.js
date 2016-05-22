'use strict';

const express = require('express');
const cons = require('consolidate');
const Trello = require('node-trello');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

// Constants
const PORT = process.env.PORT || 8080;

// App
const app = express();

app.set('port', PORT);

// template engine
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', './src/client/views');

// passport
app.use(session({ secret: 'weroWJgj32hDWOfr923nwfWji32bzppwbi34' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes.js')(app);
require('./auth_routes.js')(app, passport);
require('./api_routes.js')(app);

app.listen(app.get('port'), function() {
    console.log('Running on port:' + app.get('port'));
});
