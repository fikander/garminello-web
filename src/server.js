'use strict';

const express = require('express'),
    pg = require('pg'),
    cons = require('consolidate'),
    Trello = require('node-trello');

// Constants
const PORT = process.env.PORT || 8080;
const APP_NAME = 'Garminello';
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_OAUTH_SECRET = process.env.TRELLO_OAUTH_SECRET;

// App
const app = express();

app.set('port', PORT);

// template engine
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', './src/views');


// TEMP: cache of trello stuff
var ttoken, tid;

app.get('/', function(req, res) {
    res.render('index');
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
    res.render('trello', { trello_api_key: TRELLO_API_KEY, app_name: APP_NAME });
});

app.get('/trello_set_token', function(req, res) {
    console.log(req.query);
    ttoken = req.query.token;
    tid = req.query.id;
    res.send('ok\n');
});

app.get('/api/boards', function(req, res) {
    console.log(req.query);
    var watch_id = req.query.watch;
    var t = new Trello(TRELLO_API_KEY, ttoken);
    t.get('/1/members/me/boards', {fields: 'name'}, function(err, data) {
        if (err) {
            console.log(err);
            res.send(null);
        } else {
            console.log(data);
            res.send(data);
        }
    });
});

app.get('/api/board_lists', function(req, res) {
    console.log(req.query);
    var watch_id = req.query.watch;
    var board_id = req.query.board_id;
    var t = new Trello(TRELLO_API_KEY, ttoken);
    t.get('/1/boards/' + board_id + '/lists', {fields: 'name', cards: 'open', card_fields: 'name'}, function(err, data) {
        if (err) {
            console.log(err);
            res.send(null);
        } else {
            console.log(data);
            res.send(data);
        }
    });
});

app.get('/db_test', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM test_table', function(err, result) {
            done();
            if (err) {
                console.error(err);
                res.send("Error " + err);
            } else {
                res.send(result.rows);
            }
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('Running on port:' + app.get('port'));
});
